import { ethers, run, network } from "hardhat";
import { PortToken, PortOracle, PortDEX } from "../typechain-types";

async function main() {
  console.log("Deploying contracts to Polygon Amoy network...");
  
  // Check if we're on the correct network
  if (network.name !== "amoy") {
    console.error("Please use the 'amoy' network");
    process.exit(1);
  }

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy PortOracle
  console.log("Deploying PortOracle...");
  const PortOracle = await ethers.getContractFactory("PortOracle");
  const portOracle = await PortOracle.deploy();
  await portOracle.waitForDeployment();
  const portOracleAddress = await portOracle.getAddress();
  console.log("PortOracle deployed to:", portOracleAddress);

  // Deploy Port Tokens
  console.log("Deploying Port Tokens...");
  const PortToken = await ethers.getContractFactory("PortToken");
  
  // Singapore Port Token
  const singaporeToken = await PortToken.deploy("Singapore Port Token", "SGP", "Singapore");
  await singaporeToken.waitForDeployment();
  const singaporeTokenAddress = await singaporeToken.getAddress();
  console.log("Singapore Port Token deployed to:", singaporeTokenAddress);
  
  // Rotterdam Port Token
  const rotterdamToken = await PortToken.deploy("Rotterdam Port Token", "RTP", "Rotterdam");
  await rotterdamToken.waitForDeployment();
  const rotterdamTokenAddress = await rotterdamToken.getAddress();
  console.log("Rotterdam Port Token deployed to:", rotterdamTokenAddress);

  // Deploy PortDEX
  console.log("Deploying PortDEX...");
  const PortDEX = await ethers.getContractFactory("PortDEX");
  const portDEX = await PortDEX.deploy(portOracleAddress);
  await portDEX.waitForDeployment();
  const portDEXAddress = await portDEX.getAddress();
  console.log("PortDEX deployed to:", portDEXAddress);

  // Link tokens to ports in the oracle
  console.log("Linking tokens to ports in oracle...");
  const portOracleContract = await ethers.getContractAt("PortOracle", portOracleAddress);
  
  const singaporeTx = await portOracleContract.linkTokenToPort(singaporeTokenAddress, "Singapore");
  await singaporeTx.wait();
  console.log("Singapore token linked to port");
  
  const rotterdamTx = await portOracleContract.linkTokenToPort(rotterdamTokenAddress, "Rotterdam");
  await rotterdamTx.wait();
  console.log("Rotterdam token linked to port");

  // Set initial port data
  console.log("Setting initial port data...");
  const singaporeDataTx = await portOracleContract.setPortData(
    "Singapore",
    95, // efficiency
    1000000 // volume
  );
  await singaporeDataTx.wait();
  
  const rotterdamDataTx = await portOracleContract.setPortData(
    "Rotterdam",
    85, // efficiency
    800000 // volume
  );
  await rotterdamDataTx.wait();
  
  console.log("Initial port data set");
  console.log("Deployment completed successfully!");
  
  // Print contract addresses for frontend/analytics
  console.log("\nContract Addresses:");
  console.log("PortOracle:", portOracleAddress);
  console.log("Singapore Port Token:", singaporeTokenAddress);
  console.log("Rotterdam Port Token:", rotterdamTokenAddress);
  console.log("PortDEX:", portDEXAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
