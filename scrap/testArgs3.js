require('dotenv').config();
const { ethers } = require('ethers');
const readlineSync = require('readline-sync');
const getSignedPrices = require('../scripts/get_signed_prices');

// Constants
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
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Get deposit amount from user input
    const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
    const depositWei = ethers.parseEther(depositEth).toBigInt();

    // Fetch ETH price using getSignedPrices
    const prices = await getSignedPrices(chain);
    const ethMaxPrice = BigInt(prices[WETH].maxPriceFull);
    const ethMinPrice = BigInt(prices[WETH].minPriceFull);
    const ethPrice = (ethMaxPrice + ethMinPrice) / 2n;
    const ethPriceUsd = ethPrice / 10n**30n;
    console.log(`ETH price fetched: ${ethPriceUsd.toString()} USD`);

    // Get gas price
    const gasPrice = (await provider.getGasPrice()).toBigInt();

    // Estimate execution fee
    const baseGasLimit = 1000000n; // Example base gas limit, adjust as needed
    const multiplierFactor = 1.2; // Example multiplier factor, adjust as needed
    const adjustedGasLimit = baseGasLimit + BigInt(Math.floor(callbackGasLimit * multiplierFactor));
    const executionFeeWei = adjustedGasLimit * gasPrice;
    const executionFeeEth = Number(executionFeeWei) / 1e18;
    console.log(`Execution fee estimated: ${executionFeeEth} ETH`);

    // Calculate the actual collateral delta (ETH)
    const collateralDeltaWei = depositWei - executionFeeWei;
    const collateralDeltaEth = Number(collateralDeltaWei) / 1e18;
    if (collateralDeltaWei <= 0n) {
        console.error("Deposit amount is too low to cover the execution fee.");
        process.exit(1);
    }

    // Calculate the position size in USD based on the collateral delta
    const sizeDeltaUsd = collateralDeltaWei * ethPriceUsd;
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
            acceptablePrice: ethPriceUsd * 10n**30n * 99n / 100n, // 1% slippage tolerance
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
    console.log(`Execution Fee (ETH): ${executionFeeEth}`);
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
