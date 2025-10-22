const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Modules", function () {
  it("rebalance module emits event", async () => {
    const RebalanceModule = await ethers.getContractFactory("RebalanceModule");
    const mod = await RebalanceModule.deploy();
    await mod.deployed();

    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "address", "uint256"],
      [500, ethers.constants.AddressZero, ethers.constants.AddressZero, 0]
    );

    await expect(mod.runStrategy(ethers.constants.AddressZero, data))
      .to.emit(mod, "Rebalanced");
  });
});