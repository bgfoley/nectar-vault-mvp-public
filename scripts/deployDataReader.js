// script to deploy and initialize DataReader contract
require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  //console.log("Account balance:", (await deployer.getBalance()).toString());

  const DataReader = await ethers.getContractFactory("DataReader");
  const dataReader = await DataReader.deploy();
  

  const deploymentReceipt = await dataReader.deploymentTransaction().wait(2);
  console.log(deploymentReceipt);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
