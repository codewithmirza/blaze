require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    "worldchain-sepolia": {
      url: process.env.WORLDCHAIN_SEPOLIA_RPC_URL || "https://worldchain-sepolia.g.alchemy.com/v2/demo",
      chainId: 4801,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
      gas: 8000000,
      timeout: 60000, // 60 seconds
      httpHeaders: {}
    },
    "worldchain-sepolia-quicknode": {
      url: "https://worldchain-sepolia.quiknode.pro/YOUR_API_KEY/",
      chainId: 4801,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000,
      gas: 8000000
    },
    "worldchain-sepolia-infura": {
      url: "https://worldchain-sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      chainId: 4801,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000,
      gas: 8000000
    }
  },
  etherscan: {
    apiKey: {
      "worldchain-sepolia": "your-api-key-here"
    },
    customChains: [
      {
        network: "worldchain-sepolia",
        chainId: 4801,
        urls: {
          apiURL: "https://sepolia-explorer.worldchain.org/api",
          browserURL: "https://sepolia-explorer.worldchain.org"
        }
      }
    ]
  }
};