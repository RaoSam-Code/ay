const { ethers } = require("hardhat");

async function main() {
  const Factory = await ethers.getContractFactory("StrategyVaultFactory");
  const factory = await Factory.deploy();
  await factory.deployed();

  console.log("StrategyVaultFactory deployed:", factory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});