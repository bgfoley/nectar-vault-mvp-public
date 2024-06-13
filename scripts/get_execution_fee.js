require('dotenv').config();
const { ethers } = require('ethers');

// Load environment variables
const ARBITRUM_URL = process.env.ARBITRUM_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Connect to Arbitrum network
const provider = new ethers.providers.JsonRpcProvider(ARBITRUM_URL);

// Define the gas limit for creating an order
const gasLimit = 300000; // Example gas limit for creating an order

async function getExecutionFee() {
  try {
    // Get the current gas price from the provider
    const gasPrice = await provider.getGasPrice();

    // Calculate the execution fee
    const executionFee = gasLimit * gasPrice;

    // Convert the execution fee to Ether
    const executionFeeEther = ethers.utils.formatEther(executionFee);

    console.log(`Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
    console.log(`Execution Fee: ${executionFeeEther} ETH`);

    return executionFeeEther;
  } catch (error) {
    console.error("Error getting execution fee:", error);
  }
}

getExecutionFee();
