// script to deploy and initialize Hedge contract
require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  //console.log("Account balance:", (await deployer.getBalance()).toString());

  const Hedge = await ethers.getContractFactory("PaySmdge");
  const hedge = await Hedge.deploy();
  console.log("Contract deployed to address:", hedge.address);

  await hedge.initialize();
  console.log("Hedge contract initialized");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
