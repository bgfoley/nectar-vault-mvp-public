require('dotenv').config();
const { ethers } = require('ethers');
const readlineSync = require('readline-sync');
const axios = require('axios');

const GMX_MARKET = '0x450bb6774dd8a756274e0ab4107953259d2ac541';
const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
const HEDGE_VAULT = '0x453d2a585ab97022e2aF4F0650edA7C3A48dCFEC';
const EXECUTION_FEE = 114000000000000n; // Assumed execution fee in wei
const CALLBACK_GAS_LIMIT = 3000000n; // 3,000,000 wei

const hedgeABI = [
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
    }
];

const erc20ABI = [
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
    const tokenContract = new ethers.Contract(HEDGE_VAULT, erc20ABI, signer);
    
    console.log(`Hedge Contract: ${hedgeContract.address}`);
    console.log(`Token Contract: ${tokenContract.address}`);

    const shares = readlineSync.question('Enter the minimum amount of ETH to receive: ');
    const minimumOutWei = ethers.parseUnits(shares, 18);
    console.log(`sharesWei: ${minimumOutWei.toString()}`);

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

    // Calculate minimum eth out accounting for slippage    
  //  const minOutWei = (minimumOutWei * BigInt(1000)) / slippage;

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
            // Approve the hedge contract to transfer the shares on behalf of the user
            const approveTx = await tokenContract.approve(HEDGE_VAULT, sharesWei);
            console.log(`Approval transaction hash: ${approveTx.hash}`);
            await approveTx.wait();
            console.log('Approval transaction confirmed');

            // Estimate gas for unHedge function
            const gasEstimate = await hedgeContract.unHedge.estimateGas(sharesWei, minimumOutWei, acceptablePrice, { value: EXECUTION_FEE });
            console.log(`Estimated gas: ${gasEstimate.toString()}`);

            // Call the unHedge function
            const tx = await hedgeContract.unHedge(sharesWei, minimumOutWei, acceptablePrice, { value: EXECUTION_FEE, gasLimit: gasEstimate });
            console.log(`Transaction hash: ${tx.hash}`);
            await tx.wait();
            console.log('Transaction confirmed');
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
