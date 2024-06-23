const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();

    const hedge = await ethers.getContractAt("YourHedgeContract", hedgeAddress, deployer);

    const depositEthBn = ethers.utils.parseUnits('0.003', 'ether');
    const executionFeeBn = ethers.BigNumber.from('3000000000000');
    const callbackGasLimitBn = ethers.BigNumber.from('1500000000000');
    const collateralDeltaEth = depositEthBn.sub(executionFeeBn).sub(callbackGasLimitBn);

    const orderParams = {
        addresses: {
            receiver: hedge.address,
            callbackContract: hedge.address,
            uiFeeReceiver: ethers.constants.AddressZero,
            market: '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336',
            initialCollateralToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            swapPath: []
        },
        numbers: {
            sizeDeltaUsd: collateralDeltaEth.mul(ethPrice).div(ethers.parseUnits('1', 18)).toString(),
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
        referralCode: ethers.HashZero
    };

    try {
        const tx = await hedge._hedge(depositEthBn, deployer.address, orderParams);
        await tx.wait();
        console.log("Hedge function executed successfully");
    } catch (error) {
        console.error("Error executing hedge function:", error);
    }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
