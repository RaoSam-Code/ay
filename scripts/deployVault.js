const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy a simple module first
  const StakeModule = await ethers.getContractFactory("StakeModule");
  const stakeModule = await StakeModule.deploy();
  await stakeModule.deployed();
  console.log("StakeModule:", stakeModule.address);

  // Attach to factory or deploy a new one
  let factoryAddress = process.env.FACTORY_ADDRESS;
  let factory;
  if (!factoryAddress) {
    const Factory = await ethers.getContractFactory("StrategyVaultFactory");
    factory = await Factory.deploy();
    await factory.deployed();
    console.log("Deployed Factory:", factory.address);
  } else {
    factory = await ethers.getContractAt("StrategyVaultFactory", factoryAddress);
  }

  // Create a vault
  const tx = await factory.createVault("AutoYield Vault", "AYV", stakeModule.address);
  const receipt = await tx.wait();

  const event = receipt.events.find((e) => e.event === "VaultCreated");
  const vaultAddress = event.args.vault;
  console.log("Vault created at:", vaultAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});