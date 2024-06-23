require('dotenv').config();
const readlineSync = require('readline-sync');
const { ethers } = require('hardhat');
const getExecutionFee = require('../scripts/get_execution_fee');
const getSignedPrices = require('../scripts/get_signed_prices');

// Load environment variables
const ARBITRUM_URL = process.env.ARBITRUM_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // Example token address
const GMX_MARKET = '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336';
const HEDGE_VAULT = '0x58e62fdc1c7C593F09C58188741AFbBB75F30A93';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Connect to Arbitrum network
const provider = new ethers.JsonRpcProvider(ARBITRUM_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load the Hedge contract ABI
const hedgeAbi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "callbackContract",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "uiFeeReceiver",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "market",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "initialCollateralToken",
                "type": "address"
              },
              {
                "internalType": "address[]",
                "name": "swapPath",
                "type": "address[]"
              }
            ],
            "internalType": "struct IBaseOrderUtils.CreateOrderParamsAddresses",
            "name": "addresses",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "sizeDeltaUsd",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "initialCollateralDeltaAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "triggerPrice",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "acceptablePrice",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "executionFee",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "callbackGasLimit",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "minOutputAmount",
                "type": "uint256"
              }
            ],
            "internalType": "struct IBaseOrderUtils.CreateOrderParamsNumbers",
            "name": "numbers",
            "type": "tuple"
          },
          {
            "internalType": "enum Order.OrderType",
            "name": "orderType",
            "type": "uint8"
          },
          {
            "internalType": "enum Order.DecreasePositionSwapType",
            "name": "decreasePositionSwapType",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "isLong",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "shouldUnwrapNativeToken",
            "type": "bool"
          },
          {
            "internalType": "bytes32",
            "name": "referralCode",
            "type": "bytes32"
          }
        ],
        "internalType": "struct IBaseOrderUtils.CreateOrderParams",
        "name": "orderParams",
        "type": "tuple"
      }
    ],
    "name": "_hedge",
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
  }
  // Add the Hedge contract ABI here
];
const hedgeContract = new ethers.Contract(HEDGE_VAULT, hedgeAbi, wallet);

// Load the WETH token ABI
const wethAbi = [
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
  // Add the WETH token ABI here
];
const wethContract = new ethers.Contract(TOKEN_ADDRESS, wethAbi, wallet);

async function main() {
  try {
    // Step 1: Query the deposit amount in ETH from the user
    const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
    const depositEthBn = ethers.parseUnits(depositEth, 18);

    // Step 2: Define execution fee and callback gas limit
    const executionFeeBn = BigInt('3000000000000'); // 3e-06 ETH
    const callbackGasLimitBn = BigInt('1500000000000'); // 1.5e-06 ETH

    // Step 3: Calculate the actual collateral delta (ETH)
    const collateralDeltaEth = depositEthBn - (executionFeeBn + callbackGasLimitBn);
    if (collateralDeltaEth <= 0) {
      console.error("Deposit amount is too low to cover the execution fee and callback gas limit.");
      return;
    }

    // Step 4: Fetch ETH price
    const ethPrice = await getSignedPrices(TOKEN_ADDRESS);
    const ethPriceUsd = BigInt(ethPrice) / BigInt(10 ** 30);

    // Step 5: Calculate the position size in USD based on the collateral delta
    const sizeDeltaUsd = (collateralDeltaEth * BigInt(ethPrice)) / BigInt(10 ** 18);

    // Step 6: Create the order parameters
    const slippageTolerance = readlineSync.question('Enter your slippage tolerance (e.g., 0.01 for 1%): ');
    const slippageMultiplier = BigInt(Math.floor((1 - parseFloat(slippageTolerance)) * 1e18));
    const acceptablePrice = (BigInt(ethPrice) * slippageMultiplier) / BigInt(10 ** 18);

    // Step 7: Approve the hedge contract for transferFrom of WETH
    const approvalTx = await wethContract.approve(HEDGE_VAULT, depositEthBn);
    await approvalTx.wait();
    console.log("Tokens approved successfully");

    // Step 8: Call the hedge function
    const hedgeTx = await hedgeContract.hedge(depositEthBn, acceptablePrice);
    await hedgeTx.wait();
    console.log("Hedge function executed successfully");

    // Log the order parameters
    console.log(`ETH Price (USD): ${Number(ethPriceUsd) / 1e18}`);
    console.log(`Execution Fee (ETH): ${ethers.formatUnits(executionFeeBn, 18)}`);
    console.log(`Callback Gas Limit (ETH): ${ethers.formatUnits(callbackGasLimitBn, 18)}`);
    console.log(`Collateral Delta (ETH): ${ethers.formatUnits(collateralDeltaEth, 18)}`);
    console.log(`Size Delta (USD): ${ethers.formatUnits(sizeDeltaUsd, 18)}`);
    console.log('Order Parameters:', {
      acceptablePrice: acceptablePrice.toString(),
      sizeDeltaUsd: sizeDeltaUsd.toString(),
      initialCollateralDeltaAmount: collateralDeltaEth.toString()
    });

  } catch (error) {
    console.error("Error in main script:", error);
  }
}

// Run the main function using Hardhat runtime environment
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
