require('dotenv').config();
const readlineSync = require('readline-sync');
const { ethers } = require('ethers');
const getExecutionFee = require('../scripts/get_execution_fee');
const getSignedPrices = require('../scripts/get_signed_prices');

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
    "function hedge(uint256 amount, address user, uint256 sizeDeltaUsd, uint256 initialCollateralDeltaAmount, uint256 executionFee) external returns (bytes32 key, address orderAccount)"
];

// Connect to the Hedge contract
// const hedgeContract = new ethers.Contract(HEDGE_CONTRACT_ADDRESS, hedgeAbi, wallet);

async function main() {
  try {
    // Step 1: Query the user for the amount of ETH to deposit
    const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
    const depositEthBn = ethers.parseUnits(depositEth, 18);

    // Step 2: Get ETH price using the token address
    const ethPrice = await getSignedPrices(TOKEN_ADDRESS);

    // Step 3: Get execution fee
    const executionFeeBn = BigInt(await getExecutionFee());

    // Step 4: Calculate sizeDeltaUSD and initialCollateralDeltaAmount
    const initialCollateralDeltaAmount = depositEthBn - executionFeeBn;
    const sizeDeltaUsd = (initialCollateralDeltaAmount * ethPrice) / 10n**12n; // Adjusted for 1e30 denomination

    // Display calculated values
    console.log(`Size Delta (USD): ${sizeDeltaUsd} USD`);
    console.log(`Initial Collateral Delta (ETH): ${initialCollateralDeltaAmount} ETH`);
    console.log(`Execution Fee: ${executionFeeBn} ETH`);

    // Log the arguments that would be input for the hedge function call
    console.log("Arguments for hedge function call:");
    console.log(`Amount: ${depositEthBn}`);
    console.log(`User: ${wallet.address}`);
    console.log(`Size Delta USD: ${sizeDeltaUsd}`);
    console.log(`Initial Collateral Delta Amount: ${initialCollateralDeltaAmount}`);
    console.log(`Execution Fee: ${executionFeeBn}`);

  } catch (error) {
    console.error("Error in main script:", error);
  }
}

main();