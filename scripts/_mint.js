require('dotenv').config();
const { ethers } = require('hardhat');
const readlineSync = require('readline-sync');

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const contractAddress = '0x0dd0Afda85c095F50469E9479b7c2D6375f9eC63'; // Replace with your contract address
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "shares",
                    "type": "uint256"
                }
            ],
            "name": "mint",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const mintToAddress = readlineSync.question('Mint shares to address: ');
    const sharesToMint = readlineSync.question('Shares to mint (in 1e18 precision): ');

    console.log('Function Arguments:');
    console.log('to:', mintToAddress);
    console.log('shares:', sharesToMint);

    const execute = readlineSync.question('Do you want to execute this transaction? (y/n): ');
    if (execute.toLowerCase() === 'y') {
        try {
            const tx = await contract.mint(mintToAddress, sharesToMint);
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
