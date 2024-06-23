require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Read the ABI from the JSON file
const DATASTORE_ABI = JSON.parse(fs.readFileSync('./DataStoreABI.json'));

// DataStore contract address
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

    // Log the keys
    console.log('Keys:');
    console.log('Decrease Order Gas Limit Key:', decrease_order_gas_limit_key);
    console.log('Increase Order Gas Limit Key:', increase_order_gas_limit_key);
    console.log('Execution Gas Fee Base Amount Key:', execution_gas_fee_base_amount_key);
    console.log('Execution Gas Fee Multiplier Key:', execution_gas_fee_multiplier_key);
    console.log('Single Swap Gas Limit Key:', single_swap_gas_limit_key);
    console.log('Swap Order Gas Limit Key:', swap_order_gas_limit_key);
    console.log('Deposit Gas Limit Key:', deposit_gas_limit_key);
    console.log('Withdraw Gas Limit Key:', withdraw_gas_limit_key);

    // Connect to DataStore contract
    const dataStore = new ethers.Contract(DATASTORE_ADDRESS, DATASTORE_ABI, provider);

    // Verify contract connection
    try {
        const owner = await dataStore.owner();
        console.log('DataStore Contract Owner:', owner);
    } catch (error) {
        console.error('Error verifying DataStore contract connection:', error);
        process.exit(1);
    }

    // Retrieve gas limits from DataStore
    try {
        const decreaseOrderGasLimit = BigInt(await dataStore.getUint(decrease_order_gas_limit_key));
        const increaseOrderGasLimit = BigInt(await dataStore.getUint(increase_order_gas_limit_key));
        const executionGasFeeBaseAmount = BigInt(await dataStore.getUint(execution_gas_fee_base_amount_key));
        const executionGasFeeMultiplier = BigInt(await dataStore.getUint(execution_gas_fee_multiplier_key));
        const singleSwapGasLimit = BigInt(await dataStore.getUint(single_swap_gas_limit_key));
        const swapOrderGasLimit = BigInt(await dataStore.getUint(swap_order_gas_limit_key));
        const depositGasLimit = BigInt(await dataStore.getUint(deposit_gas_limit_key));
        const withdrawGasLimit = BigInt(await dataStore.getUint(withdraw_gas_limit_key));

        console.log('Gas Limits:');
        console.log('Decrease Order Gas Limit:', decreaseOrderGasLimit.toString());
        console.log('Increase Order Gas Limit:', increaseOrderGasLimit.toString());
        console.log('Execution Gas Fee Base Amount:', executionGasFeeBaseAmount.toString());
        console.log('Execution Gas Fee Multiplier:', executionGasFeeMultiplier.toString());
        console.log('Single Swap Gas Limit:', singleSwapGasLimit.toString());
        console.log('Swap Order Gas Limit:', swapOrderGasLimit.toString());
        console.log('Deposit Gas Limit:', depositGasLimit.toString());
        console.log('Withdraw Gas Limit:', withdrawGasLimit.toString());
    } catch (error) {
        console.error('Error retrieving gas limits from DataStore:', error);
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
