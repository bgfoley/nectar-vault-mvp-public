require('dotenv').config();
const { ethers } = require('ethers');
const readlineSync = require('readline-sync');

const HEDGE_VAULT = '0x0dd0Afda85c095F50469E9479b7c2D6375f9eC63';
const EXECUTION_FEE = 114000000000000n; // Assumed execution fee in wei

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

    // Query user for inputs
    const shares = readlineSync.question('Enter the amount of shares: ');
    const amount = readlineSync.question('Enter the amount of ETH to receive: ');
    const price = readlineSync.question('Enter the acceptable price: ');

    // Convert inputs to BigInt
    const sharesWei = ethers.parseUnits(shares, 18);
    const amountWei = ethers.parseUnits(amount, 18);
    const priceWei = BigInt(price);

    console.log('Function Arguments:');
    console.log('shares:', sharesWei.toString());
    console.log('amount:', amountWei.toString());
    console.log('price:', priceWei.toString());

    const execute = readlineSync.question('Do you want to execute this transaction? (y/n): ');
    if (execute.toLowerCase() === 'y') {
        try {
            // Approve the hedge contract to transfer the shares on behalf of the user
            const approveTx = await tokenContract.approve(HEDGE_VAULT, sharesWei);
            console.log(`Approval transaction hash: ${approveTx.hash}`);
            await approveTx.wait();
            console.log('Approval transaction confirmed');

            // Estimate gas for unHedge function
            const gasEstimate = await hedgeContract.unHedge.estimateGas(sharesWei, amountWei, priceWei, { value: EXECUTION_FEE });
            console.log(`Estimated gas: ${gasEstimate.toString()}`);

            // Call the unHedge function
            const tx = await hedgeContract.unHedge(sharesWei, amountWei, priceWei, { value: EXECUTION_FEE, gasLimit: gasEstimate });
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
