const { ethers } = require("hardhat");

async function main() {
  await hre.run('compile');

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", balance.toString());

  const Hedge = await ethers.getContractFactory("ShMdge");
  const hedge = await Hedge.deploy();

  await hedge.deployed();
  console.log("Hedge contract deployed to:", hedge.address);

  const initializeTx = await hedge.initialize();
  await initializeTx.wait();
  console.log("Contract initialized");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
