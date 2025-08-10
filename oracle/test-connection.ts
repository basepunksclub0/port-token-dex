import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing connection to blockchain network...');
    
    // Connect to Ethereum network
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const network = await provider.getNetwork();
    
    console.log('Connected to network:', network.name);
    console.log('Chain ID:', network.chainId);
    
    // Test wallet connection
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const balance = await provider.getBalance(wallet.address);
    
    console.log('Wallet address:', wallet.address);
    console.log('Wallet balance:', ethers.formatEther(balance), 'ETH');
    
    console.log('Connection test successful!');
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
