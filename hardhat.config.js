require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const POLYGON_RPC = process.env.POLYGON_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    hardhat: {},
    ...(POLYGON_RPC ? {
      polygon: { url: POLYGON_RPC, accounts: PRIVATE_KEY }
    } : {})
  }
};