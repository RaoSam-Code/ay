const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StrategyVault", function () {
  it("mints shares on deposit and allows withdraw", async () => {
    const [manager, user] = await ethers.getSigners();

    const StakeModule = await ethers.getContractFactory("StakeModule");
    const stakeModule = await StakeModule.connect(manager).deploy();
    await stakeModule.deployed();

    const Vault = await ethers.getContractFactory("StrategyVault");
    const vault = await Vault.connect(manager).deploy("AutoYield Vault", "AYV", manager.address, stakeModule.address);
    await vault.deployed();

    // deposit
    await expect(vault.connect(user).deposit({ value: ethers.utils.parseEther("1") }))
      .to.emit(vault, "Deposited");

    expect(await vault.balanceOf(user.address)).to.equal(ethers.utils.parseEther("1"));

    // withdraw
    await expect(vault.connect(user).withdraw(ethers.utils.parseEther("0.4")))
      .to.emit(vault, "Withdrawn");

    expect(await vault.balanceOf(user.address)).to.equal(ethers.utils.parseEther("0.6"));
  });

  it("manager can execute strategy", async () => {
    const [manager] = await ethers.getSigners();

    const StakeModule = await ethers.getContractFactory("StakeModule");
    const stakeModule = await StakeModule.deploy();
    await stakeModule.deployed();

    const Vault = await ethers.getContractFactory("StrategyVault");
    const vault = await Vault.deploy("AutoYield Vault", "AYV", manager.address, stakeModule.address);
    await vault.deployed();

    // deposit some ETH to vault from manager for testing
    await vault.connect(manager).deposit({ value: ethers.utils.parseEther("1") });

    // dummy target staking contract: use manager address (will just accept ETH)
    const data = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256"],
      [manager.address, ethers.utils.parseEther("0.2")]
    );

    await expect(vault.connect(manager).executeStrategy(data)).to.emit(vault, "StrategyExecuted");
  });
});