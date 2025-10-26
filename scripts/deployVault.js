// scripts/deployVault.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const StakeModule = await ethers.getContractFactory("StakeModule");
  const stakeModule = await StakeModule.deploy();
  console.log("StakeModule:", stakeModule.target ?? stakeModule.address);

  let factoryAddress = process.env.FACTORY_ADDRESS;
  let factory;
  if (!factoryAddress) {
    const Factory = await ethers.getContractFactory("StrategyVaultFactory");
    factory = await Factory.deploy();
    console.log("Deployed Factory:", factory.target ?? factory.address);
    factoryAddress = factory.target ?? factory.address;
  } else {
    factory = await ethers.getContractAt("StrategyVaultFactory", factoryAddress);
  }

  const tx = await factory.createVault("AutoYield Vault", "AYV", stakeModule.target ?? stakeModule.address);
  const receipt = await tx.wait();

  // First try: parse emitted event if present
  let vaultAddress;
  if (receipt.events && receipt.events.length) {
    const evt = receipt.events.find((e) => e && e.event === "VaultCreated");
    if (evt && evt.args && evt.args.vault) {
      vaultAddress = evt.args.vault;
    }
  }

  // Fallback: query factory state
  if (!vaultAddress) {
    const all = await factory.getAllVaults();
    if (all.length === 0) {
      throw new Error("No vaults found on factory after createVault");
    }
    vaultAddress = all[all.length - 1];
  }

  console.log("Vault created at:", vaultAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});