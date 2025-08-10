import { expect } from "chai";
import { ethers } from "hardhat";

describe("PortDEX", function () {
  let portOracle: any;
  let portDEX: any;
  let portToken: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy PortOracle
    const PortOracle = await ethers.getContractFactory("PortOracle");
    portOracle = await PortOracle.deploy();
    await portOracle.waitForDeployment();

    // Deploy PortDEX
    const PortDEX = await ethers.getContractFactory("PortDEX");
    portDEX = await PortDEX.deploy(await portOracle.getAddress());
    await portDEX.waitForDeployment();

    // Deploy PortToken
    const PortToken = await ethers.getContractFactory("PortToken");
    portToken = await PortToken.deploy(
      "Test Port Token",
      "TPT",
      "TestPort",
      18,
      1000000
    );
    await portToken.waitForDeployment();

    // Link token to port in oracle
    await portOracle.linkTokenToPort(await portToken.getAddress(), "TestPort");
    
    // Set initial port data
    await portOracle.setPortData("TestPort", 1000);
  });

  describe("Deployment", function () {
    it("Should set the right owner for PortOracle", async function () {
      expect(await portOracle.owner()).to.equal(owner.address);
    });

    it("Should set the right oracle address in PortDEX", async function () {
      expect(await portDEX.oracle()).to.equal(await portOracle.getAddress());
    });
  });

  describe("Liquidity", function () {
    it("Should allow adding liquidity", async function () {
      const tokenAmount = ethers.parseEther("100");
      const ethAmount = ethers.parseEther("1");
      
      // Approve DEX to spend tokens
      await portToken.approve(await portDEX.getAddress(), tokenAmount);
      
      // Add liquidity
      await portDEX.addLiquidity(await portToken.getAddress(), tokenAmount, {
        value: ethAmount
      });
      
      const [tokenBalance, ethBalance, totalShares] = await portDEX.getPoolInfo(await portToken.getAddress());
      
      expect(tokenBalance).to.equal(tokenAmount);
      expect(ethBalance).to.equal(ethAmount);
      expect(totalShares).to.equal(ethAmount);
    });
  });

  describe("Trading", function () {
    it("Should allow swapping ETH for tokens", async function () {
      // First add liquidity to the pool
      const initialTokenAmount = ethers.parseEther("1000");
      const initialEthAmount = ethers.parseEther("10");
      
      await portToken.approve(await portDEX.getAddress(), initialTokenAmount);
      await portDEX.addLiquidity(await portToken.getAddress(), initialTokenAmount, {
        value: initialEthAmount
      });
      
      // Now try to swap ETH for tokens
      const ethToSwap = ethers.parseEther("1");
      const initialTokenBalance = await portToken.balanceOf(addr1.address);
      
      await portDEX.connect(addr1).swapEthForTokens(await portToken.getAddress(), {
        value: ethToSwap
      });
      
      const finalTokenBalance = await portToken.balanceOf(addr1.address);
      expect(finalTokenBalance).to.be.gt(initialTokenBalance);
    });
  });
});
