require('dotenv').config();
const readlineSync = require('readline-sync');
const { ethers } = require('ethers');
const getExecutionFee = require('./get_execution_fee');
const getSignedPrices = require('./get_signed_prices');

// Load environment variables
const ARBITRUM_URL = process.env.ARBITRUM_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // Example token address
const GMX_MARKET = '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336';
const HEDGE_VAULT = '0xYourHedgeVaultAddressHere';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Connect to Arbitrum network
const provider = new ethers.JsonRpcProvider(ARBITRUM_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function main() {
  try {
    // Step 1: Query the deposit amount in ETH from the user
    const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
    const depositEthBn = ethers.parseUnits(depositEth, 18);

    // Step 2: Estimate the execution fee (in ETH)
    const executionFeeBn = await getExecutionFee();

    // Step 3: Calculate the actual collateral delta (ETH)
    const collateralDeltaEth = depositEthBn - executionFeeBn;
    if (collateralDeltaEth <= 0) {
      console.error("Deposit amount is too low to cover the execution fee.");
      return;
    }

    // Step 4: Fetch ETH price
    const ethPrice = await getSignedPrices(TOKEN_ADDRESS);
    const ethPriceUsd = ethPrice / 10n ** 30n;

    // Step 5: Calculate the position size in USD based on the collateral delta
    const sizeDeltaUsd = collateralDeltaEth * ethPriceUsd / 10n ** 18n;

    // Step 6: Create the order parameters
    const slippageTolerance = readlineSync.question('Enter your slippage tolerance (e.g., 0.01 for 1%): ');
    const slippageMultiplier = 1n - BigInt(Math.floor(parseFloat(slippageTolerance) * 1e18));
    const acceptablePrice = ethPrice * slippageMultiplier / 10n ** 18n;

    const orderParams = {
      addresses: {
        receiver: HEDGE_VAULT,
        callbackContract: HEDGE_VAULT,
        uiFeeReceiver: ZERO_ADDRESS,
        market: GMX_MARKET,
        initialCollateralToken: TOKEN_ADDRESS,
        swapPath: []
      },
      numbers: {
        sizeDeltaUsd: sizeDeltaUsd.toString(),
        initialCollateralDeltaAmount: collateralDeltaEth.toString(),
        triggerPrice: '0',
        acceptablePrice: acceptablePrice.toString(),
        executionFee: executionFeeBn.toString(),
        callbackGasLimit: '2000000',
        minOutputAmount: '0'
      },
      orderType: 0, // market_increase
      decreasePositionSwapType: 0, // no_swap
      isLong: false,
      shouldUnwrapNativeToken: true,
      referralCode: ethers.ZeroHash
    };

    // Log the order parameters
    console.log(`ETH Price (USD): ${Number(ethPriceUsd) / 1e18}`);
    console.log(`Execution Fee (ETH): ${ethers.formatUnits(executionFeeBn, 18)}`);
    console.log(`Collateral Delta (ETH): ${ethers.formatUnits(collateralDeltaEth, 18)}`);
    console.log(`Size Delta (USD): ${ethers.formatUnits(sizeDeltaUsd, 18)}`);
    console.log('Order Parameters:', orderParams);

  } catch (error) {
    console.error("Error in main script:", error);
  }
}

main();