require('dotenv').config();
const { ethers } = require('ethers');
const readlineSync = require('readline-sync');
const getSignedPrices = require('../scripts/get_signed_prices');

async function generateHedgeArguments() {
  const deployerPrivateKey = process.env.PRIVATE_KEY;
  const providerUrl = process.env.ARBITRUM_URL;
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const deployerWallet = new ethers.Wallet(deployerPrivateKey, provider);

  const deployerAddress = deployerWallet.address;
  console.log("Using deployer account:", deployerAddress);

  const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
  const depositEthNumber = parseFloat(depositEth);
  if (isNaN(depositEthNumber) || depositEthNumber <= 0) {
    console.error("Invalid deposit amount entered.");
    return;
  }
  const depositEthBn = BigInt(depositEthNumber * 10 ** 18);

  const executionFeeBn = BigInt('3000000000000');
  const callbackGasLimitBn = BigInt('3000000000000');
  const collateralDeltaEth = depositEthBn - executionFeeBn - callbackGasLimitBn;
  if (collateralDeltaEth <= 0) {
    console.error("Deposit amount is too low to cover the execution fee and callback gas limit.");
    return;
  }

  const TOKEN_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
  const GMX_MARKET = '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336';
  const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

  const ethPrice = await getSignedPrices(TOKEN_ADDRESS);
  const ethPriceUsd = BigInt(ethPrice) / BigInt(10 ** 30);

  const sizeDeltaUsd = (collateralDeltaEth * BigInt(ethPrice)) / BigInt(10 ** 18);

  const slippageTolerance = readlineSync.question('Enter your slippage tolerance (e.g., 0.01 for 1%): ');
  const slippageMultiplier = BigInt(Math.floor((1 - parseFloat(slippageTolerance)) * 1e18));
  const acceptablePrice = (BigInt(ethPrice) * slippageMultiplier) / BigInt(10 ** 18);

  const orderParams = [
    [
      deployerAddress,
      deployerAddress,
      ADDRESS_ZERO,
      GMX_MARKET,
      TOKEN_ADDRESS,
      []
    ],
    [
      sizeDeltaUsd.toString(),
      collateralDeltaEth.toString(),
      '0',
      acceptablePrice.toString(),
      executionFeeBn.toString(),
      callbackGasLimitBn.toString(),
      '0'
    ],
    0,
    0,
    false,
    false,
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  ];

  // Estimate gas for the hedge transaction
  const hedgeContractAddress = '0x3cCa753479EEdEb4392A62B93568505F7B40D644'; // Replace with your deployed hedge contract address
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
        "stateMutability": "payable",
        "type": "function"
      }      
  ];
  const hedgeContract = new ethers.Contract(hedgeContractAddress, hedgeAbi, deployerWallet);

  let estimatedGas;
  try {
    estimatedGas = await hedgeContract.estimateGas.hedge(depositEthBn, deployerAddress, orderParams, { value: executionFeeBn });
  } catch (error) {
    console.error("Error estimating gas:", error);
    return;
  }

  console.log("Estimated gas:", estimatedGas.toString());

  // Set an appropriate execution fee based on the estimated gas
  const gasPrice = await provider.getGasPrice();
  const adjustedExecutionFeeBn = estimatedGas * gasPrice;

  console.log("Generated arguments for hedge function:");
  console.log("amount:", depositEthBn.toString());
  console.log("user:", deployerAddress);
  console.log("orderParams:", JSON.stringify(orderParams, null, 2));
  console.log("executionFee:", adjustedExecutionFeeBn.toString());
}

generateHedgeArguments()
  .then(() => console.log("Arguments generated successfully"))
  .catch(error => {
    console.error("Error generating arguments:", error);
  });
