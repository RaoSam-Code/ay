const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Governance", function () {
  it("governance token mint works", async () => {
    const [owner, user] = await ethers.getSigners();
    const Gov = await ethers.getContractFactory("GovernanceToken");
    const gov = await Gov.deploy("AutoYield Gov", "AYG");
    await gov.deployed();

    await gov.connect(owner).mint(user.address, ethers.utils.parseEther("100"));
    expect(await gov.balanceOf(user.address)).to.eq(ethers.utils.parseEther("100"));
  });
});