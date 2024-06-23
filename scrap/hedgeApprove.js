require('dotenv').config();
const readlineSync = require('readline-sync');
const { ethers } = require('hardhat');
const getExecutionFee = require('../scripts/get_execution_fee');
const getSignedPrices = require('../scripts/get_signed_prices');

async function main() {
  // Load environment variables
  const ARBITRUM_URL = process.env.ARBITRUM_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const HEDGE_CONTRACT_ADDRESS = '0xA35021791259042B3c00E9C80618e2282183D945';
  const TOKEN_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // Example token address

  // Connect to Arbitrum network
  const provider = new ethers.JsonRpcProvider(ARBITRUM_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Define the Hedge contract ABI
  const hedgeAbi = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "acceptablePrice",
          "type": "uint256"
        }
      ],
      "name": "hedge",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "key",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "orderAccount",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // Add other ABI definitions as needed
  ];

  // Define the ERC20 token contract ABI (for the approve function)
  const erc20Abi = [
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_spender",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        },
        {
          "name": "_spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    // Add other ERC20 ABI definitions as needed
  ];

  // Connect to the Hedge and ERC20 token contracts
  const hedgeContract = new ethers.Contract(HEDGE_CONTRACT_ADDRESS, hedgeAbi, wallet);
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, wallet);

  try {
    // Step 1: Query the user for the amount of ETH to deposit and slippage tolerance
    const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
    const slippageTolerance = readlineSync.question('Enter your slippage tolerance (e.g., 0.01 for 1%): ');
    const depositEthBn = BigInt(ethers.parseUnits(depositEth, 18).toString());

    // Step 2: Get ETH price using the token address
    const ethPriceStr = await getSignedPrices(TOKEN_ADDRESS);
    const ethPrice = BigInt(ethPriceStr);

    // Step 3: Calculate acceptable price
    const slippageMultiplier = BigInt(Math.floor((1 - parseFloat(slippageTolerance)) * 1e18));
    const acceptablePrice = (ethPrice * slippageMultiplier) / BigInt(1e18);

    // Step 4: Get execution fee
    const executionFeeBn = BigInt(await getExecutionFee());

    // Step 5: Log the calculated values and parameters for the hedge function
    console.log(`ETH Price (USD): ${Number(ethPrice) / 1e30} USD`);
    console.log(`Acceptable Price: ${acceptablePrice.toString()}`);
    console.log(`Execution Fee: ${executionFeeBn.toString()} ETH`);

    // Step 6: Check balance and allowance
    const walletBalance = await tokenContract.balanceOf(wallet.address);
    const allowance = await tokenContract.allowance(wallet.address, HEDGE_CONTRACT_ADDRESS);
    console.log(`Wallet Balance: ${walletBalance.toString()}`);
    console.log(`Allowance: ${allowance.toString()}`);

    if (walletBalance < depositEthBn) {
      throw new Error('Insufficient balance');
    }

    if (allowance < depositEthBn) {
      const approveTx = await tokenContract.approve(HEDGE_CONTRACT_ADDRESS, depositEthBn);
      await approveTx.wait();
      console.log('Tokens approved successfully');
    }

    // Step 7: Call the hedge function
    console.log("Attempting to execute hedge function with parameters:");
    console.log(`Deposit ETH: ${depositEthBn.toString()}`);
    console.log(`Acceptable Price: ${acceptablePrice.toString()}`);
    console.log(`Execution Fee: ${executionFeeBn.toString()}`);

    const hedgeTx = await hedgeContract.hedge(depositEthBn, acceptablePrice, {
      gasLimit: 300000, // Adjust as necessary
      gasPrice: ethers.parseUnits('10', 'gwei'), // Adjust as necessary
    });
    await hedgeTx.wait();
    console.log('Hedge function executed successfully');

  } catch (error) {
    console.error("Error in main script:", error);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
