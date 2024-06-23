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
    {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minimumSharesOut",
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
        "stateMutability": "payable",
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
    console.log(`ethPrice: ${ethPrice.toString()}`);

    const slippageMultiplier = BigInt(Math.floor((1 - parseFloat(slippageTolerance)) * 1e18));
    console.log(`slippageMultiplier: ${slippageMultiplier.toString()}`);
    
    
    const minimumSharesOut = (depositWei * ethPrice) / BigInt(1e12); // Adjusted to 1e18 precision
    console.log(`minimumSharesOut: ${minimumSharesOut.toString()}`);

    console.log('Function Arguments:');
    console.log('amount:', depositWei.toString());
    console.log('minimumSharesOut:', minimumSharesOut.toString());

    // Simulate the transaction using eth_call
    try {
        const callResult = await hedgeContract.callStatic.hedge(depositWei, minimumSharesOut, { value: depositWei + EXECUTION_FEE });
        console.log('eth_call simulation result:', callResult);
    } catch (error) {
        console.error('eth_call simulation failed:', error);
        return;
    }

    const execute = readlineSync.question('Do you want to execute this transaction? (y/n): ');
    if (execute.toLowerCase() === 'y') {
        try {
            const tx = await hedgeContract.hedge(depositWei, minimumSharesOut, { value: depositWei + EXECUTION_FEE });
            console.log(`Transaction hash: ${tx.hash}`);
        } catch (error) {
            console.error('Transaction failed:', error);
        }
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
