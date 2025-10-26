const { ethers } = require("hardhat");

async function main() {
  const Factory = await ethers.getContractFactory("StrategyVaultFactory");
  const factory = await Factory.deploy();
  console.log("StrategyVaultFactory deployed:", factory.target ?? factory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});