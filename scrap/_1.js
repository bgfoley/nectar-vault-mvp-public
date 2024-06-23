require('dotenv').config();
const { ethers } = require('ethers');
const readlineSync = require('readline-sync');
const axios = require('axios');

const GMX_MARKET = '0x450bb6774dd8a756274e0ab4107953259d2ac541';
const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
const HEDGE_VAULT = '0x3cCa753479EEdEb4392A62B93568505F7B40D644';
const EXECUTION_FEE = 114000000000000n; // Assumed execution fee in wei
const CALLBACK_GAS_LIMIT = 3000000n; // 3,000,000 wei

const hedgeABI = [
    'function hedge(uint256 amount, uint256 minimumSharesOut) external payable returns (bytes32, address)'
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
        return price;
    } catch (error) {
        console.error(`Error getting price for token ${tokenAddress}:`, error);
    }
}

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const hedgeContract = new ethers.Contract(HEDGE_VAULT, hedgeABI, signer);

    const depositEth = readlineSync.question('Enter the amount of ETH to hedge: ');
    const depositWei = ethers.parseUnits(depositEth, 18);
    console.log(`depositWei: ${depositWei.toString()}`);

    const slippageTolerance = readlineSync.question('Enter your slippage tolerance (e.g., 0.01 for 1%): ');
    console.log(`slippageTolerance: ${slippageTolerance}`);

    const ethPrice = await getSignedPrices(WETH);
    const ethPriceUsd = ethPrice / BigInt(10 ** 6); // Corrected the conversion to keep significant digits
    console.log(`ethPrice: ${ethPrice.toString()}`);
    console.log(`ethPriceUsd: ${ethPriceUsd.toString()}`);

    const slippageMultiplier = BigInt(Math.floor((1 - parseFloat(slippageTolerance)) * 1e18));
    console.log(`slippageMultiplier: ${slippageMultiplier.toString()}`);
    
    const acceptablePrice = (ethPrice * slippageMultiplier) / BigInt(1e18);
    console.log(`acceptablePrice: ${acceptablePrice.toString()}`);
    
    const minimumSharesOut = (depositWei * ethPriceUsd) / BigInt(1e18);
    console.log(`minimumSharesOut: ${minimumSharesOut.toString()}`);

    console.log('Function Arguments:');
    console.log('amount:', depositWei.toString());
    console.log('minimumSharesOut:', minimumSharesOut.toString());

    const execute = readlineSync.question('Do you want to execute this transaction? (y/n): ');
    if (execute.toLowerCase() === 'y') {
        const tx = await hedgeContract.hedge(depositWei, minimumSharesOut, { value: depositWei + EXECUTION_FEE });
        console.log(`Transaction hash: ${tx.hash}`);
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
