require('dotenv').config();
const { ethers } = require('hardhat');
const readlineSync = require('readline-sync');
const getSignedPrices = require('../scripts/get_signed_prices');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract
  let hedge, hedgeAddress;
  try {
    const Hedge = await ethers.getContractFactory("ShMdge");
    hedge = await Hedge.deploy();
    await hedge.waitForDeployment();
    hedgeAddress = await hedge.getAddress();
    console.log("Contract deployed to address:", hedgeAddress);

    if (!hedgeAddress) {
      throw new Error("Contract deployment failed. Address is undefined.");
    }
  } catch (error) {
    console.error("Error deploying the contract:", error);
    return;
  }

  // Initialize the contract
  try {
    await hedge.initialize();
    console.log("Hedge contract initialized");
  } catch (error) {
    console.error("Error initializing the hedge contract:", error);
    return;
  }

  const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
  const depositEthBn = ethers.parseUnits(depositEth, 18);

  const executionFeeBn = BigInt('3000000000000');
  const callbackGasLimitBn = BigInt('1500000000000');
  const collateralDeltaEth = depositEthBn - (executionFeeBn + callbackGasLimitBn);
  if (collateralDeltaEth <= 0) {
    console.error("Deposit amount is too low to cover the execution fee and callback gas limit.");
    return;
  }

  const TOKEN_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
  const GMX_MARKET = '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336';
  const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

  const ethPrice = await getSignedPrices(TOKEN_ADDRESS);
  const ethPriceUsd = BigInt(ethPrice) / (BigInt(10) ** BigInt(30));

  const sizeDeltaUsd = (collateralDeltaEth * BigInt(ethPrice)) / (BigInt(10) ** BigInt(18));

  const slippageTolerance = readlineSync.question('Enter your slippage tolerance (e.g., 0.01 for 1%): ');
  const slippageMultiplier = BigInt(Math.floor((1 - parseFloat(slippageTolerance)) * 1e18));
  const acceptablePrice = (BigInt(ethPrice) * slippageMultiplier) / BigInt(10 ** 18);

  const orderParams = {
    addresses: {
      receiver: hedgeAddress,
      callbackContract: hedgeAddress,
      uiFeeReceiver: ADDRESS_ZERO,
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
      callbackGasLimit: callbackGasLimitBn.toString(),
      minOutputAmount: '0'
    },
    orderType: 0,
    decreasePositionSwapType: 0,
    isLong: false,
    shouldUnwrapNativeToken: false,
    referralCode: ethers.ZeroHash // Ensuring referralCode is set properly
  };

  console.log("Final orderParams structure:", JSON.stringify(orderParams, null, 2));

  try {
    const wethAbi = [
      "function approve(address spender, uint256 amount) external returns (bool)"
    ];
    const wethContract = new ethers.Contract(TOKEN_ADDRESS, wethAbi, deployer);
    const approvalTx = await wethContract.approve(hedgeAddress, depositEthBn);
    await approvalTx.wait();
    console.log("Tokens approved successfully");
  } catch (error) {
    console.error("Error approving tokens:", error);
    return;
  }

  try {
    const hedgeTx = await hedge.hedge(depositEthBn, deployer.address, orderParams, { value: executionFeeBn });
    await hedgeTx.wait();
    console.log("Hedge function executed successfully");
  } catch (error) {
    console.error("Error executing hedge function:", error);
    console.error("Revert reason:", error.reason); // This will log the revert reason if available
  }

  console.log(`ETH Price (USD): ${Number(ethPriceUsd) / 1e18}`);
  console.log(`Execution Fee (ETH): ${executionFeeBn / BigInt(10 ** 18)}`);
  console.log(`Callback Gas Limit (ETH): ${callbackGasLimitBn / BigInt(10 ** 18)}`);
  console.log(`Collateral Delta (ETH): ${collateralDeltaEth / BigInt(10 ** 18)}`);
  console.log(`Size Delta (USD): ${sizeDeltaUsd / BigInt(10 ** 18)}`);
  console.log('Order Parameters:', {
    acceptablePrice: acceptablePrice.toString(),
    sizeDeltaUsd: sizeDeltaUsd.toString(),
    initialCollateralDeltaAmount: collateralDeltaEth.toString()
  });
  console.log('Addresses:', {
    receiver: hedgeAddress,
    callbackContract: hedgeAddress,
    uiFeeReceiver: ADDRESS_ZERO,
    market: GMX_MARKET,
    initialCollateralToken: TOKEN_ADDRESS
  });
  console.log('OrderParams:', JSON.stringify(orderParams, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error in main script:", error);
    process.exit(1);
  });