require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');
require('hardhat-gas-reporter');
require('@typechain/hardhat');
require('hardhat-contract-sizer');
require('solidity-docgen');

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 21,
    enabled: true,
  },
  networks: {
    arbitrum: {
      url: process.env.ARBITRUM_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
  docgen: {
    input: "./contracts",       // Your contracts folder
    output: "./docs",           // The output folder for generated docs
    pages: "files"
  }
};
