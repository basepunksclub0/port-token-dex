import { ethers } from "hardhat";

async function main() {
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy PortOracle
  const PortOracle = await ethers.getContractFactory("PortOracle");
  const portOracle = await PortOracle.deploy();
  await portOracle.waitForDeployment();
  console.log("PortOracle deployed to:", await portOracle.getAddress());

  // Deploy PortDEX
  const PortDEX = await ethers.getContractFactory("PortDEX");
  const portDEX = await PortDEX.deploy(await portOracle.getAddress());
  await portDEX.waitForDeployment();
  console.log("PortDEX deployed to:", await portDEX.getAddress());

  // Deploy a few sample PortTokens
  const PortToken = await ethers.getContractFactory("PortToken");
  
  // Singapore Port Token
  const singaporeToken = await PortToken.deploy(
    "Singapore Port Token",
    "SPT",
    "Singapore",
    18,
    1000000
  );
  await singaporeToken.waitForDeployment();
  console.log("Singapore Port Token deployed to:", await singaporeToken.getAddress());
  
  // Rotterdam Port Token
  const rotterdamToken = await PortToken.deploy(
    "Rotterdam Port Token",
    "RPT",
    "Rotterdam",
    18,
    1000000
  );
  await rotterdamToken.waitForDeployment();
  console.log("Rotterdam Port Token deployed to:", await rotterdamToken.getAddress());

  // Link tokens to ports in oracle
  const singaporeOracleTx = await portOracle.linkTokenToPort(
    await singaporeToken.getAddress(),
    "Singapore"
  );
  await singaporeOracleTx.wait();
  console.log("Linked Singapore token to port in oracle");

  const rotterdamOracleTx = await portOracle.linkTokenToPort(
    await rotterdamToken.getAddress(),
    "Rotterdam"
  );
  await rotterdamOracleTx.wait();
  console.log("Linked Rotterdam token to port in oracle");

  // Set initial port data in oracle
  const singaporeDataTx = await portOracle.setPortData("Singapore", 1000);
  await singaporeDataTx.wait();
  console.log("Set initial Singapore port data");

  const rotterdamDataTx = await portOracle.setPortData("Rotterdam", 1200);
  await rotterdamDataTx.wait();
  console.log("Set initial Rotterdam port data");

  console.log("All contracts deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
