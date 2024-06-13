require('dotenv').config();
const { ethers } = require('ethers');

// Load environment variables
const ARBITRUM_URL = process.env.ARBITRUM_URL;

// Connect to Arbitrum network
const provider = new ethers.JsonRpcProvider(ARBITRUM_URL);

// Define the gas limit for creating an order
const gasLimit = 300000; // Example gas limit for creating an order

async function getExecutionFee() {
  try {
    // Get the current gas price from the provider
    const gasPrice = (await provider.getFeeData()).gasPrice;

    // Calculate the execution fee
    const executionFee = BigInt(gasLimit) * gasPrice;

    // Return the execution fee as a BigNumber
    return executionFee;
  } catch (error) {
    console.error("Error getting execution fee:", error);
  }
}

module.exports = getExecutionFee;
