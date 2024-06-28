require('dotenv').config();
const { ethers } = require('ethers');
const readlineSync = require('readline-sync');
const axios = require('axios');

const GMX_MARKET = '0x450bb6774dd8a756274e0ab4107953259d2ac541';
const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
const HEDGE_VAULT = '0x1f0a633Be28237B5c3D2E77EDFbef41546ddD748';
const EXECUTION_FEE = 114000000000000n; // Assumed execution fee in wei
const CALLBACK_GAS_LIMIT = 3000000n; // 3,000,000 wei

const unHedgeABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "shares", "type": "uint256" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "unHedge",
        "outputs": [
            { "internalType": "bytes32", "name": "key", "type": "bytes32" },
            { "internalType": "address", "name": "orderAccount", "type": "address" }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "accountOrders",
        "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "key", "type": "bytes32" }],
        "name": "orders",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

async function getSignedPrices(tokenAddress) {
    try {
        const response = await axios.get('https://arbitrum-api.gmxinfra.io/signed_prices/latest');
        const tokenData = response.data.signedPrices.find(price => price.tokenAddress === tokenAddress);
        const maxPriceFull = BigInt(tokenData.maxPriceFull);
        const minPriceFull = BigInt(tokenData.minPriceFull);
        const price = (maxPriceFull + minPriceFull) / 2n;
        console.log(`Fetched prices for ${tokenAddress}:`);
        console.log(`maxPriceFull: ${maxPriceFull.toString()}`);
        console.log(`minPriceFull: ${minPriceFull.toString()}`);
        console.log(`medianPrice: ${price.toString()}`);
        return { maxPriceFull, minPriceFull, price };
    } catch (error) {
        console.error(`Error getting price for token ${tokenAddress}:`, error);
    }
}

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`HEDGE_VAULT: ${HEDGE_VAULT}`);
    console.log(`Provider: ${provider}`);
    console.log(`Signer: ${signer.address}`);

    const hedgeContract = new ethers.Contract(HEDGE_VAULT, unHedgeABI, signer);
    const tokenContract = new ethers.Contract(HEDGE_VAULT, erc20ABI, signer);
    
    console.log(`Hedge Contract: ${hedgeContract.address}`);
    console.log(`Token Contract: ${tokenContract.address}`);

    const minimumOut = readlineSync.question('Enter the minimum amount of ETH to receive: ');
    const minimumOutWei = ethers.parseUnits(minimumOut, 18);
    console.log(`minimumOutWei: ${minimumOutWei.toString()}`);

    const slippageTolerance = readlineSync.question('Enter your slippage tolerance (e.g., 0.01 for 1%): ');
    const slippage = BigInt(Math.round(parseFloat(slippageTolerance) * 1000 + 1000));
    console.log(`slippage: ${slippage}`);

    const prices = await getSignedPrices(WETH);
    const ethMaxPrice = prices.maxPriceFull;
    const acceptablePrice = prices.price;
    console.log(`ethMaxPrice: ${ethMaxPrice.toString()}`);
    console.log(`acceptablePrice: ${acceptablePrice.toString()}`);

    // Calculate sizeDeltaUsd
    const sizeDeltaUsd = (minimumOutWei * acceptablePrice * BigInt(1000)) / slippage / BigInt(1e12);
    console.log(`sizeDeltaUsd: ${sizeDeltaUsd.toString()}`);

    // Calculate shares to unHedge based on sizeDeltaUsd
    const sharesWei = sizeDeltaUsd;
    console.log(`sharesWei: ${sharesWei.toString()}`);

    console.log('Function Arguments:');
    console.log('shares:', sharesWei.toString());
    console.log('amount:', minimumOutWei.toString());
    console.log('price:', acceptablePrice.toString());

    const execute = readlineSync.question('Do you want to execute this transaction? (y/n): ');
    if (execute.toLowerCase() === 'y') {
        try {
            // Check user's balance before unHedge
            const userBalanceBefore = await hedgeContract.balanceOf(signer.address);
            console.log(`User balance before: ${userBalanceBefore.toString()}`);

            // Check Hedge vault's balance before unHedge
            const hedgeBalanceBefore = await hedgeContract.balanceOf(HEDGE_VAULT);
            console.log(`Hedge balance before: ${hedgeBalanceBefore.toString()}`);

            // Estimate gas for unHedge function
            const gasEstimate = await hedgeContract.estimateGas.unHedge(sharesWei, minimumOutWei, acceptablePrice, { value: EXECUTION_FEE });
            console.log(`Estimated gas: ${gasEstimate.toString()}`);

            // Call the unHedge function
            const tx = await hedgeContract.unHedge(sharesWei, minimumOutWei, acceptablePrice, { value: EXECUTION_FEE, gasLimit: gasEstimate });
            console.log(`Transaction hash: ${tx.hash}`);
            await tx.wait();
            console.log('Transaction confirmed');

            const receipt = await provider.getTransactionReceipt(tx.hash);
            const gasUsed = receipt.gasUsed;
            const gasCost = gasUsed.mul(receipt.effectiveGasPrice);
            console.log(`Total gas cost: ${ethers.utils.formatEther(gasCost)} ETH`);

            // Check that the key has been stored in accountOrders[user] array
            const userOrders = await hedgeContract.accountOrders(signer.address);
            const orderKey = userOrders[userOrders.length - 1];
            console.log(`Order key: ${orderKey}`);

            // Check that the user's address has been stored in the orders[key] mapping
            const orderAccount = await hedgeContract.orders(orderKey);
            console.log(`Order account: ${orderAccount}`);

            // Check user's balance after unHedge
            const userBalanceAfter = await hedgeContract.balanceOf(signer.address);
            console.log(`User balance after: ${userBalanceAfter.toString()}`);

            // Check Hedge vault's balance after unHedge
            const hedgeBalanceAfter = await hedgeContract.balanceOf(HEDGE_VAULT);
            console.log(`Hedge balance after: ${hedgeBalanceAfter.toString()}`);

            // Wait for afterOrderExecution to be called and check for share burn and ETH transfer
            provider.once(orderKey, async (log) => {
                console.log('afterOrderExecution called');

                // Check user's balance after shares are burned
                const finalUserBalance = await hedgeContract.balanceOf(signer.address);
                console.log(`User's final share balance: ${ethers.utils.formatUnits(finalUserBalance, 18)} shares`);

                // Check Hedge's balance after shares are burned
                const finalHedgeBalance = await hedgeContract.balanceOf(HEDGE_VAULT);
                console.log(`Hedge's final share balance: ${ethers.utils.formatUnits(finalHedgeBalance, 18)} shares`);

                // Check user's WETH balance
                const userWETHBalance = await tokenContract.balanceOf(signer.address);
                console.log(`User's WETH balance: ${ethers.utils.formatUnits(userWETHBalance, 18)} WETH`);
            });

        } catch (error) {
            console.error('Transaction failed:', error);
        }
    }
}

// Catch process interruption (e.g., Ctrl+C)
process.on('SIGINT', () => {
    console.log('\nProcess cancelled by user.');
    process.exit(0);
});

main().catch(error => {
    console.error(error);
    process.exit(1);
});
