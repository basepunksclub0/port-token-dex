import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts to local network...");
  
  // Get accounts
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Deployer account:", deployer.address);
  console.log("User1 account:", user1.address);
  console.log("User2 account:", user2.address);

  // Deploy PortOracle
  const PortOracle = await ethers.getContractFactory("PortOracle");
  const portOracle = await PortOracle.deploy();
  await portOracle.waitForDeployment();
  const oracleAddress = await portOracle.getAddress();
  console.log("PortOracle deployed to:", oracleAddress);

  // Deploy PortDEX
  const PortDEX = await ethers.getContractFactory("PortDEX");
  const portDEX = await PortDEX.deploy(oracleAddress);
  await portDEX.waitForDeployment();
  const dexAddress = await portDEX.getAddress();
  console.log("PortDEX deployed to:", dexAddress);

  // Deploy Singapore Port Token
  const singaporeToken = await ethers.deployContract("PortToken", [
    "Singapore Port Token",
    "SPT",
    "Singapore",
    18,
    1000000
  ]);
  await singaporeToken.waitForDeployment();
  const singaporeTokenAddress = await singaporeToken.getAddress();
  console.log("Singapore Port Token deployed to:", singaporeTokenAddress);

  // Deploy Rotterdam Port Token
  const rotterdamToken = await ethers.deployContract("PortToken", [
    "Rotterdam Port Token",
    "RPT",
    "Rotterdam",
    18,
    1000000
  ]);
  await rotterdamToken.waitForDeployment();
  const rotterdamTokenAddress = await rotterdamToken.getAddress();
  console.log("Rotterdam Port Token deployed to:", rotterdamTokenAddress);

  // Link tokens to ports in oracle
  await portOracle.linkTokenToPort(singaporeTokenAddress, "Singapore");
  console.log("Linked Singapore token to port in oracle");

  await portOracle.linkTokenToPort(rotterdamTokenAddress, "Rotterdam");
  console.log("Linked Rotterdam token to port in oracle");

  // Set initial port data in oracle
  await portOracle.setPortData("Singapore", 1000);
  console.log("Set initial Singapore port data");

  await portOracle.setPortData("Rotterdam", 1200);
  console.log("Set initial Rotterdam port data");

  // Add liquidity to Singapore pool
  console.log("Adding liquidity to Singapore pool...");
  const singaporeTokenAmount = ethers.parseEther("100000");
  const singaporeEthAmount = ethers.parseEther("100");
  
  await singaporeToken.approve(dexAddress, singaporeTokenAmount);
  await portDEX.addLiquidity(singaporeTokenAddress, singaporeTokenAmount, {
    value: singaporeEthAmount
  });
  console.log("Added liquidity to Singapore pool");

  // Add liquidity to Rotterdam pool
  console.log("Adding liquidity to Rotterdam pool...");
  const rotterdamTokenAmount = ethers.parseEther("100000");
  const rotterdamEthAmount = ethers.parseEther("100");
  
  await rotterdamToken.approve(dexAddress, rotterdamTokenAmount);
  await portDEX.addLiquidity(rotterdamTokenAddress, rotterdamTokenAmount, {
    value: rotterdamEthAmount
  });
  console.log("Added liquidity to Rotterdam pool");

  // Test swap ETH for Singapore tokens
  console.log("Testing swap: ETH for Singapore tokens...");
  const ethToSwap = ethers.parseEther("1");
  const user1InitialSingaporeBalance = await singaporeToken.balanceOf(user1.address);
  
  await portDEX.connect(user1).swapEthForTokens(singaporeTokenAddress, {
    value: ethToSwap
  });
  
  const user1FinalSingaporeBalance = await singaporeToken.balanceOf(user1.address);
  console.log("User1 received:", ethers.formatEther(user1FinalSingaporeBalance - user1InitialSingaporeBalance), "SPT tokens");

  // Test swap Singapore tokens for ETH
  console.log("Testing swap: Singapore tokens for ETH...");
  const tokensToSwap = ethers.parseEther("100");
  const user1InitialEthBalance = await user1.provider.getBalance(user1.address);
  
  await singaporeToken.connect(user1).approve(dexAddress, tokensToSwap);
  await portDEX.connect(user1).swapTokensForEth(singaporeTokenAddress, tokensToSwap);
  
  const user1FinalEthBalance = await user1.provider.getBalance(user1.address);
  console.log("User1 received:", ethers.formatEther(user1FinalEthBalance - user1InitialEthBalance), "ETH");

  console.log("\n--- Deployment Summary ---");
  console.log("PortOracle Address:", oracleAddress);
  console.log("PortDEX Address:", dexAddress);
  console.log("Singapore Token Address:", singaporeTokenAddress);
  console.log("Rotterdam Token Address:", rotterdamTokenAddress);
  console.log("----------------------------\n");
  console.log("Use these addresses to configure your frontend and backend services.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
