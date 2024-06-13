// Replace this with logic from hedge_test_debug3

require('dotenv').config();
const readlineSync = require('readline-sync');
const { ethers } = require('ethers');
const getExecutionFee = require('./get_execution_fee');
const getSignedPrices = require('./get_signed_prices');

// Load environment variables
const ARBITRUM_URL = process.env.ARBITRUM_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const HEDGE_CONTRACT_ADDRESS = process.env.HEDGE_CONTRACT_ADDRESS;
const TOKEN_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // Example token address

// Connect to Arbitrum network
const provider = new ethers.JsonRpcProvider(ARBITRUM_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Define the Hedge contract ABI (add your contract's ABI here)
const hedgeAbi = [
    "function hedge(uint256 amount, address user, uint256 sizeDeltaUsd, uint256 initialCollateralDeltaAmount, uint256 executionFee) external returns (bytes32 key, address orderAccount)"
];

// Connect to the Hedge contract
const hedgeContract = new ethers.Contract(HEDGE_CONTRACT_ADDRESS, hedgeAbi, wallet);

async function main() {
  try {
    // Step 1: Query the user for the amount of ETH to deposit
    const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
    const depositEthBn = ethers.parseEther(depositEth);

    // Step 2: Get ETH price using the token address
    const ethPrice = await getSignedPrices(TOKEN_ADDRESS);

    // Step 3: Get execution fee
    const executionFee = ethers.formatUnits(await getExecutionFee(), 'ether');

    // Step 4: Calculate sizeDeltaUSD and initialCollateralDeltaAmount
    const initialCollateralDeltaAmount = depositEthBn.sub(executionFee);
    const sizeDeltaUsd = initialCollateralDeltaAmount.mul(ethers.parseUnits(ethPrice.toString(), 18)).div(ethers.parseUnits('1', 18));

    // Display calculated values
    console.log(`Size Delta (USD): ${ethers.formatUnits(sizeDeltaUsd, 18)} USD`);
    console.log(`Initial Collateral Delta (ETH): ${ethers.formatUnits(initialCollateralDeltaAmount, 18)} ETH`);
    console.log(`Execution Fee: ${ethers.formatUnits(executionFee, 18)} ETH`);

    // Step 5: Call the hedge function on the contract
    const tx = await hedgeContract.hedge(
      depositEthBn,
      HEDGE_CONTRACT_ADDRESS,
      sizeDeltaUsd,
      initialCollateralDeltaAmount,
      executionFee
    );

    console.log(`Transaction submitted: ${tx.hash}`);
  } catch (error) {
    console.error("Error in main script:", error);
  }
}

main();
