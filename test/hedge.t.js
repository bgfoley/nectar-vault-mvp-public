require('dotenv').config();
const { ethers } = require('ethers');
const readlineSync = require('readline-sync');
const axios = require('axios');

const GMX_MARKET = '0x450bb6774dd8a756274e0ab4107953259d2ac541';
const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
const HEDGE_VAULT = '0x1f0a633Be28237B5c3D2E77EDFbef41546ddD748';
const EXECUTION_FEE = 114000000000000n; // Assumed execution fee in wei
const CALLBACK_GAS_LIMIT = 3000000n; // 3,000,000 wei

const hedgeABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "internalType": "uint256", "name": "shares", "type": "uint256" },
            { "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "hedge",
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

    const hedgeContract = new ethers.Contract(HEDGE_VAULT, hedgeABI, signer);
    
    console.log(`Hedge Contract: ${hedgeContract.address}`);

    const depositEth = readlineSync.question('Enter the amount of ETH to hedge: ');
    const depositWei = ethers.parseUnits(depositEth, 18);
    console.log(`depositWei: ${depositWei.toString()}`);

    const slippageTolerance = readlineSync.question('Enter your slippage tolerance (e.g., 0.01 for 1%): ');
    const slippage = BigInt(Math.round(parseFloat(slippageTolerance) * 1000 + 1000));
    console.log(`slippage: ${slippage}`);

    const prices = await getSignedPrices(WETH);
    const ethMaxPrice = prices.maxPriceFull;
    const acceptablePrice = prices.price;
    console.log(`ethMaxPrice: ${ethMaxPrice.toString()}`);
    console.log(`acceptablePrice: ${acceptablePrice.toString()}`);

    const shares = (depositWei * slippage * acceptablePrice) / BigInt(1e15); // Adjusted to 1e18 precision
    console.log(`shares: ${acceptablePrice.toString()}`);

    console.log('Function Arguments:');
    console.log('amount:', depositWei.toString());
    console.log('shares:', shares.toString());
    console.log('price:', acceptablePrice.toString());

    const execute = readlineSync.question('Do you want to execute this transaction? (y/n): ');
    if (execute.toLowerCase() === 'y') {
        try {
            const tx = await hedgeContract.hedge(depositWei, shares, acceptablePrice, { value: depositWei + EXECUTION_FEE });
            console.log(`Transaction hash: ${tx.hash}`);
            await tx.wait();
            const receipt = await provider.getTransactionReceipt(tx.hash);
            const gasUsed = receipt.gasUsed;
            const gasCost = gasUsed.mul(receipt.effectiveGasPrice);
            console.log(`Total gas cost: ${ethers.formatEther(gasCost)} ETH`);

            // Check that the key has been stored in accountOrders[user] array
            const userOrders = await hedgeContract.accountOrders(signer.address);
            const orderKey = userOrders[userOrders.length - 1];
            console.log(`Order key: ${orderKey}`);

            // Check that the user's address has been stored in the orders[key] mapping
            const orderAccount = await hedgeContract.orders(orderKey);
            console.log(`Order account: ${orderAccount}`);

            // Wait for afterOrderExecution to be called and check for shares minted
            provider.once(orderKey, async (log) => {
                console.log('afterOrderExecution called');
                const userBalance = await hedgeContract.balanceOf(signer.address);
                console.log(`User's new share balance: ${ethers.formatUnits(userBalance, 18)} shares`);
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
