import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "contracts",
  },
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts:
        process.env.LOCAL_PRIVATE_KEY !== undefined
          ? [process.env.LOCAL_PRIVATE_KEY]
          : [],
    },
    "mint-mainnet": {
      url: "https://eth-mainnet.g.alchemy.com/v2/fHK0-Z9Y65IMkYub9iA_qBBp-DzMFM1O",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    "mint-sepolia": {
      url: "https://sepolia-testnet-rpc.mintchain.io",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      "mint-mainnet": "mainnet",
      "mint-sepolia": "testnet",
    },
    customChains: [
      {
        network: "mint-mainnet",
        chainId: 185,
        urls: {
          apiURL:
            "https://api.routescan.io/v2/network/mainnet/evm/185/etherscan",
          browserURL: "https://mintscan.org",
        },
      },
      {
        network: "mint-sepolia",
        chainId: 1687,
        urls: {
          apiURL: "https://sepolia-testnet-explorer.mintchain.io//api",
          browserURL: "https://sepolia-testnet-explorer.mintchain.io/",
        },
      },
    ],
  },
};

export default config;
