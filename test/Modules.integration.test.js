const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AutoYield Modules Integration — 10 tests", function () {
  let manager, user, other;
  let Factory, Vault, StakeModule, RebalanceModule, LendingModule, GovToken, Governor;
  let factory, stakeModule, rebalanceModule, lendingModule, vault, gov;

  beforeEach(async function () {
    [manager, user, other] = await ethers.getSigners();

    // Deploy modules and core contracts
    StakeModule = await ethers.getContractFactory("StakeModule");
    stakeModule = await StakeModule.connect(manager).deploy();
    await stakeModule.deployed();

    RebalanceModule = await ethers.getContractFactory("RebalanceModule");
    rebalanceModule = await RebalanceModule.connect(manager).deploy();
    await rebalanceModule.deployed();

    LendingModule = await ethers.getContractFactory("LendingModule");
    lendingModule = await LendingModule.connect(manager).deploy();
    await lendingModule.deployed();

    Factory = await ethers.getContractFactory("StrategyVaultFactory");
    factory = await Factory.connect(manager).deploy();
    await factory.deployed();

    // Create a vault via factory
    const tx = await factory.connect(manager).createVault("AutoYield Vault", "AYV", stakeModule.address);
    const receipt = await tx.wait();
    const event = receipt.events.find((e) => e.event === "VaultCreated");
    const vaultAddress = event.args.vault;

    Vault = await ethers.getContractFactory("StrategyVault");
    vault = await Vault.attach(vaultAddress);

    // Deploy governance token for tests
    GovToken = await ethers.getContractFactory("GovernanceToken");
    gov = await GovToken.connect(manager).deploy("AutoYield Gov", "AYG");
    await gov.deployed();
  });

  it("1) deposit mints shares equal to native amount (basic)", async function () {
    await expect(vault.connect(user).deposit({ value: ethers.utils.parseEther("1") }))
      .to.emit(vault, "Deposited");
    expect(await vault.balanceOf(user.address)).to.equal(ethers.utils.parseEther("1"));
    expect(await ethers.provider.getBalance(vault.address)).to.equal(ethers.utils.parseEther("1"));
  });

  it("2) withdraw burns shares and returns native", async function () {
    await vault.connect(user).deposit({ value: ethers.utils.parseEther("2") });
    await expect(vault.connect(user).withdraw(ethers.utils.parseEther("0.5")))
      .to.emit(vault, "Withdrawn");
    expect(await vault.balanceOf(user.address)).to.equal(ethers.utils.parseEther("1.5"));
  });

  it("3) only manager can executeStrategy", async function () {
    // deposit some ETH to vault
    await vault.connect(manager).deposit({ value: ethers.utils.parseEther("1") });

    const data = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256"],
      [manager.address, ethers.utils.parseEther("0.2")]
    );

    // manager success
    await expect(vault.connect(manager).executeStrategy(data)).to.emit(vault, "StrategyExecuted");

    // non-manager should revert
    await expect(vault.connect(user).executeStrategy(data)).to.be.revertedWith("Vault: not manager");
  });

  it("4) stake module forwards native to target (simulated by manager as target)", async function () {
    // deposit from manager so vault has balance
    await vault.connect(manager).deposit({ value: ethers.utils.parseEther("1") });

    // update vault strategy to stakeModule (factory created it with stakeModule but ensure)
    await vault.connect(manager).updateStrategy(stakeModule.address);

    const data = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256"],
      [other.address, ethers.utils.parseEther("0.3")]
    );

    // execute: stakeModule will call target (other) with ETH; other is EOA and accepts
    await expect(vault.connect(manager).executeStrategy(data)).to.emit(stakeModule, "Staked");
    // vault balance should decrease by 0.3
    expect(await ethers.provider.getBalance(vault.address)).to.equal(ethers.utils.parseEther("0.7"));
  });

  it("5) rebalance module emits event and does not revert on placeholder", async function () {
    // call rebalance module directly
    const dataRe = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "address", "uint256"],
      [500, ethers.constants.AddressZero, ethers.constants.AddressZero, 0]
    );
    await expect(rebalanceModule.runStrategy(vault.address, dataRe)).to.emit(rebalanceModule, "Rebalanced");
  });

  it("6) lending module lent/unlent event behaviors", async function () {
    const lendData = ethers.utils.defaultAbiCoder.encode(
      ["uint8", "address", "uint256"],
      [0, ethers.constants.AddressZero, ethers.utils.parseEther("1")]
    );
    await expect(lendingModule.runStrategy(vault.address, lendData)).to.emit(lendingModule, "Lent");

    const unlendData = ethers.utils.defaultAbiCoder.encode(
      ["uint8", "address", "uint256"],
      [1, ethers.constants.AddressZero, ethers.utils.parseEther("1")]
    );
    await expect(lendingModule.runStrategy(vault.address, unlendData)).to.emit(lendingModule, "Unlent");
  });

  it("7) factory returns created vaults and ownership transfer works", async function () {
    const addresses = await factory.getAllVaults();
    expect(addresses.length).to.be.gte(1);
    // transfer ownership of factory
    await factory.connect(manager).transferOwnership(other.address);
    // only new owner can transfer again (verify by calling transfer from new owner)
    await factory.connect(other).transferOwnership(manager.address);
    expect(await factory.getAllVaults()).to.not.be.undefined;
  });

  it("8) manager updates strategy and event emitted", async function () {
    // deploy a new module and update
    const NewStake = await ethers.getContractFactory("StakeModule");
    const newStake = await NewStake.connect(manager).deploy();
    await newStake.deployed();

    await expect(vault.connect(manager).updateStrategy(newStake.address))
      .to.emit(vault, "StrategyUpdated");
  });

  it("9) fee params set and accrueManagementFee mints to recipient", async function () {
    // manager sets fee params
    await vault.connect(manager).setFeeParams(100, other.address); // 1%
    expect(await vault.managementFeeBps()).to.equal(100);
    expect(await vault.feeRecipient()).to.equal(other.address);

    // accrue fee: mint some shares to feeRecipient
    const before = await vault.balanceOf(other.address);
    await vault.connect(manager).accrueManagementFee(ethers.utils.parseEther("0.1"));
    const after = await vault.balanceOf(other.address);
    expect(after.sub(before)).to.equal(ethers.utils.parseEther("0.1"));
  });

  it("10) security: deposit zero should revert and cannot set excessive fee", async function () {
    await expect(vault.connect(user).deposit({ value: 0 })).to.be.revertedWith("Vault: zero deposit");
    // attempt to set excessive fee
    await expect(vault.connect(manager).setFeeParams(1000, other.address)).to.be.revertedWith("Vault: fee too high");
  });
});