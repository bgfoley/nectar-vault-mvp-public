require('dotenv').config();
const readlineSync = require('readline-sync');
const { ethers } = require('ethers');
const getExecutionFee = require('../../scripts/get_execution_fee');
const getSignedPrices = require('../../scripts/get_signed_prices');

// Load environment variables
const ARBITRUM_URL = process.env.ARBITRUM_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// const HEDGE_CONTRACT_ADDRESS = process.env.HEDGE_CONTRACT_ADDRESS;
const TOKEN_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // Example token address

// Connect to Arbitrum network
const provider = new ethers.JsonRpcProvider(ARBITRUM_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Define the Hedge contract ABI (add your contract's ABI here)
const hedgeAbi = [
 
];

// Connect to the Hedge contract
// const hedgeContract = new ethers.Contract(HEDGE_CONTRACT_ADDRESS, hedgeAbi, wallet);

async function main() {
  try {
    // Step 1: Query the user for the amount of ETH to deposit and slippage tolerance
    const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
    const slippageTolerance = readlineSync.question('Enter your slippage tolerance (e.g., 0.01 for 1%): ');
    const depositEthBn = BigInt(ethers.parseUnits(depositEth, 18).toString());

    // Step 2: Get ETH price using the token address
    const ethPrice = await getSignedPrices(TOKEN_ADDRESS);

    // Step 3: Calculate acceptable price
    const slippageMultiplier = BigInt(Math.floor((1 - parseFloat(slippageTolerance)) * 1e18));
    const acceptablePrice = ethPrice * slippageMultiplier / BigInt(1e18);

    // Step 4: Get execution fee
    const executionFeeBn = BigInt(await getExecutionFee());

    // Step 5: Log the calculated values and parameters for the hedge function
    console.log(`ETH Price (USD): ${Number(ethPrice) / 1e30} USD`);
    console.log(`Acceptable Price: ${acceptablePrice}`);
    console.log(`Execution Fee: ${executionFeeBn} ETH`);

    // Log the arguments that would be input for the hedge function call
    console.log("Arguments for hedge function call:");
    console.log(`Amount: ${depositEthBn}`);
    console.log(`Acceptable Price: ${acceptablePrice}`);

  } catch (error) {
    console.error("Error in main script:", error);
  }
}

main();
