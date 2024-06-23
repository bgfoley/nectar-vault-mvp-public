require('dotenv').config();
const { ethers } = require('ethers');
const readlineSync = require('readline-sync');
const axios = require('axios');
const fs = require('fs');
const getSignedPrices = require('../scripts/get_signed_prices');

// Read the ABI from the JSON file
const DATASTORE_ABI = JSON.parse(fs.readFileSync('./DataStoreABI.json'));

// DataStore contract address and ABI
const DATASTORE_ADDRESS = '0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8';

// Keys for the gas limits
const decrease_order_gas_limit_key = ethers.keccak256(ethers.toUtf8Bytes("decreaseOrderGasLimit"));
const increase_order_gas_limit_key = ethers.keccak256(ethers.toUtf8Bytes("increaseOrderGasLimit"));
const execution_gas_fee_base_amount_key = ethers.keccak256(ethers.toUtf8Bytes("executionGasFeeBaseAmount"));
const execution_gas_fee_multiplier_key = ethers.keccak256(ethers.toUtf8Bytes("executionGasFeeMultiplier"));
const single_swap_gas_limit_key = ethers.keccak256(ethers.toUtf8Bytes("singleSwapGasLimit"));
const swap_order_gas_limit_key = ethers.keccak256(ethers.toUtf8Bytes("swapOrderGasLimit"));
const deposit_gas_limit_key = ethers.keccak256(ethers.toUtf8Bytes("depositGasLimit"));
const withdraw_gas_limit_key = ethers.keccak256(ethers.toUtf8Bytes("withdrawGasLimit"));

const chain = 'arbitrum';
const GMX_MARKET = '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336';
const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
const HEDGE_VAULT = '0x3cCa753479EEdEb4392A62B93568505F7B40D644';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const user_wallet_address = process.env.USER_WALLET_ADDRESS;
const should_unwrap_native_token = true;
const referral_code = "0x0000000000000000000000000000000000000000000000000000000000000000";
const order_type = 0; // market_increase
const decrease_position_swap_type = 0; // no_swap
const callbackGasLimit = 3000000n; // 3,000,000 wei

async function main() {
  const providerUrl = process.env.ARBITRUM_URL;
  const provider = new ethers.JsonRpcProvider(providerUrl);

  // Test the connection
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log('Connected to the Ethereum network. Current block number:', blockNumber);
  } catch (error) {
    console.error('Failed to connect to the Ethereum network:', error);
    process.exit(1);
  }

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Connect to DataStore contract
  const dataStore = new ethers.Contract(DATASTORE_ADDRESS, DATASTORE_ABI, provider);

  // Get deposit amount from user input
  const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
  const depositWei = ethers.parseUnits(depositEth, 18);

  // Fetch ETH price using getSignedPrices
  const ethPrice = await getSignedPrices(WETH);
 // const ethPriceUsd = ethPrice / 10n ** 30n;
  console.log(`ETHPrice: ${ethPrice.toString()}`);

  // Get gas price
  const gasPriceData = await provider.getFeeData();
  const gasPrice = BigInt(gasPriceData.gasPrice.toString());
  console.log(`GasPrice: ${gasPrice}`);

  // Retrieve gas limits from DataStore
  const baseGasLimit = BigInt((await dataStore.getUint(execution_gas_fee_base_amount_key)).toString());
  const multiplierFactor = BigInt((await dataStore.getUint(execution_gas_fee_multiplier_key)).toString());
  const estimatedGasLimit = BigInt((await dataStore.getUint(increase_order_gas_limit_key)).toString());
  console.log(`Gas limit estimated: ${estimatedGasLimit.toString()} ETH`);

  // Calculate the adjusted gas limit and execution fee
  const adjustedGasLimit = baseGasLimit + (estimatedGasLimit * multiplierFactor / 10n**8n) + callbackGasLimit;
  const executionFeeWei = adjustedGasLimit * gasPrice;
  console.log(`Execution fee estimated: ${executionFeeWei.toString()} ETH`);

  // Calculate the actual collateral delta (ETH)
  const collateralDeltaWei = depositWei - executionFeeWei;
  const collateralDeltaEth = collateralDeltaWei / 10n**18n;
  if (collateralDeltaWei <= 0n) {
    console.error("Deposit amount is too low to cover the execution fee.");
    process.exit(1);
  }

  // Calculate the position size in USD based on the collateral delta
  const sizeDeltaUsd = collateralDeltaWei * ethPrice;
  console.log(`Size Delta (USD): ${sizeDeltaUsd.toString()}`);

  // Create the order parameters
  const orderParams = {
    addresses: {
      receiver: HEDGE_VAULT,
      callbackContract: HEDGE_VAULT,
      uiFeeReceiver: ZERO_ADDRESS,
      market: GMX_MARKET,
      initialCollateralToken: WETH,
      swapPath: []
    },
    numbers: {
      sizeDeltaUsd: sizeDeltaUsd * 10n**30n,
      initialCollateralDeltaAmount: collateralDeltaWei,
      triggerPrice: 0n,
      acceptablePrice: ethMinPriceFull, // using the minimum price full as acceptable price
      executionFee: executionFeeWei,
      callbackGasLimit: callbackGasLimit,
      minOutputAmount: 0n
    },
    orderType: order_type,
    decreasePositionSwapType: decrease_position_swap_type,
    isLong: false,
    shouldUnwrapNativeToken: should_unwrap_native_token,
    referralCode: referral_code
  };

  // Log the order parameters
  console.log(`ETH Price (USD): ${ethPriceUsd.toString()}`);
  console.log(`Execution Fee (ETH): ${executionFeeWei}`);
  console.log(`Collateral Delta (ETH): ${collateralDeltaEth}`);
  console.log(`Size Delta (USD): ${sizeDeltaUsd.toString()}`);
  console.log(`Order Parameters:`, orderParams);

  // Print CreateOrderParams for Remix
  function printCreateOrderParams(orderParams) {
    const formattedArgs = `
      CreateOrderParams(
        ${orderParams.addresses.receiver},
        ${orderParams.addresses.callbackContract},
        ${orderParams.addresses.uiFeeReceiver},
        ${orderParams.addresses.market},
        ${orderParams.addresses.initialCollateralToken},
        [${orderParams.addresses.swapPath.join(', ')}],
        ${orderParams.numbers.sizeDeltaUsd.toString()},
        ${orderParams.numbers.initialCollateralDeltaAmount.toString()},
        ${orderParams.numbers.triggerPrice.toString()},
        ${orderParams.numbers.acceptablePrice.toString()},
        ${orderParams.numbers.executionFee.toString()},
        ${orderParams.numbers.callbackGasLimit.toString()},
        ${orderParams.numbers.minOutputAmount.toString()},
        ${orderParams.orderType},
        ${orderParams.decreasePositionSwapType},
        ${orderParams.isLong},
        ${orderParams.shouldUnwrapNativeToken},
        ${orderParams.referralCode}
      )`;
    console.log(formattedArgs);
  }

  printCreateOrderParams(orderParams);

  // Uncomment the following line to execute the order if you are ready
  // const hedgeContract = new ethers.Contract(HEDGE_VAULT, HedgeContractABI, signer);
  // const tx = await hedgeContract.hedge(depositWei, user_wallet_address, orderParams, { value: depositWei });
  // await tx.wait();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
