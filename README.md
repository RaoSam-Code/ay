# AY DAO

A modular DeFi strategy vault system with a factory, pluggable strategy modules, and minimal governance.

## Features
- StrategyVaultFactory deploys new vaults with chosen module
- StrategyVault accepts native deposits, mints shares, executes modules
- Modules: Stake, Rebalance, Lending (MVP placeholders)
- Governance token + basic governor scaffold
- Hardhat setup with tests and deploy scripts

## Quickstart
1. npm i
2. npx hardhat compile
3. npx hardhat test
4. npx hardhat run scripts/deployFactory.js --network hardhat
5. npx hardhat run scripts/deployVault.js --network hardhat

## Notes
- Modules are placeholders. Wire real protocol adapters and oracles as needed.
- Use Kwala automation to trigger `executeStrategy()` with encoded payloads.
- For ERC20 vaults, refactor deposit/withdraw to handle token assets.