# Port Token DEX - Deployment Guide

This guide provides step-by-step instructions for deploying the Port Token DEX to Ethereum Sepolia testnet.

## Prerequisites

- Node.js 18+
- Ethereum wallet with Sepolia ETH
- Infura or Alchemy RPC endpoint
- MetaMask browser extension

## 1. Environment Setup

### Get Sepolia ETH
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Request test ETH for your deployment wallet
3. Ensure you have at least 0.1 ETH for deployment costs

### Get RPC Endpoint
1. Create account at [Infura](https://infura.io/) or [Alchemy](https://alchemy.com/)
2. Create new project for Ethereum
3. Copy the Sepolia testnet RPC URL

## 2. Deploy Smart Contracts

```bash
cd contracts
npm install

# Configure environment
cp .env.example .env
```

Edit `contracts/.env`:
```
RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY_WITHOUT_0x
```

Deploy contracts:
```bash
npm run compile
npm run deploy:sepolia
```

**IMPORTANT**: Save all contract addresses from the deployment output:
- PortOracle address
- PortDEX address  
- All PortToken addresses (pSINGAPORE, pDUBAI, etc.)

## 3. Configure Frontend

```bash
cd ../frontend
npm install

# Configure environment
cp .env.example .env
```

Edit `frontend/.env` with deployed addresses:
```
NEXT_PUBLIC_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_DEX_ADDRESS=0x...
NEXT_PUBLIC_SINGAPORE_TOKEN=0x...
NEXT_PUBLIC_DUBAI_TOKEN=0x...
NEXT_PUBLIC_ROTTERDAM_TOKEN=0x...
NEXT_PUBLIC_SHANGHAI_TOKEN=0x...
NEXT_PUBLIC_LA_TOKEN=0x...
```

Build and test:
```bash
npm run build
npm start
```

## 4. Deploy Oracle Service

```bash
cd ../oracle
npm install

# Configure environment
cp .env.example .env
```

Edit `oracle/.env`:
```
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY_WITHOUT_0x
ORACLE_ADDRESS=<DEPLOYED_ORACLE_ADDRESS>
PORT_API_URL=https://api.portperformance.com/data
PORT=3001
```

Build and start:
```bash
npm run build
npm start
```

## 5. Verify Deployment

### Check Contract Deployment
1. Visit [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Search for your contract addresses
3. Verify contracts are deployed and have code

### Test Frontend
1. Open browser to `http://localhost:3000`
2. Connect MetaMask wallet
3. Switch to Sepolia network
4. Verify token balances load correctly

### Test Oracle Service
1. Check health: `curl http://localhost:3001/health`
2. Check data: `curl http://localhost:3001/oracle/data`
3. Monitor logs for automatic updates

## 6. Production Deployment

### Frontend (Vercel/Netlify)
1. Push code to GitHub repository
2. Connect to Vercel or Netlify
3. Add environment variables in platform settings
4. Deploy and get production URL

### Oracle Service (Railway/Heroku)
1. Create account on Railway or Heroku
2. Connect GitHub repository
3. Set environment variables
4. Deploy service
5. Ensure service stays running 24/7

## 7. Post-Deployment Tasks

### Initialize Token Pools
1. Connect admin wallet to frontend
2. Navigate to Liquidity page
3. Create initial pools for each token pair
4. Add initial liquidity (recommended: 1000 tokens each)

### Fund Test Users
1. Use admin wallet to transfer tokens to test users
2. Provide instructions for users to get Sepolia ETH
3. Test all functionality with multiple wallets

### Monitor System
1. Check oracle updates every 10 minutes
2. Monitor transaction success rates
3. Watch for any error logs
4. Verify price updates reflect in frontend

## 8. Security Checklist

- [ ] Private keys stored securely (never in code)
- [ ] Environment variables configured correctly
- [ ] Contract ownership transferred to secure wallet
- [ ] Oracle updater permissions set correctly
- [ ] Frontend validates all user inputs
- [ ] Gas limits set appropriately
- [ ] Slippage protection enabled

## 9. Troubleshooting

### Common Issues

**"Insufficient funds for gas"**
- Ensure wallet has enough Sepolia ETH
- Check gas price settings in MetaMask

**"Transaction failed"**
- Verify contract addresses are correct
- Check token approvals before swaps
- Ensure pool has sufficient liquidity

**"Oracle not updating"**
- Check oracle service logs
- Verify RPC endpoint is working
- Ensure private key has ETH for gas

**"Frontend not loading prices"**
- Verify contract addresses in .env
- Check browser console for errors
- Ensure MetaMask is connected to Sepolia

### Support
For deployment issues, check:
1. Contract deployment logs
2. Frontend browser console
3. Oracle service logs
4. Network connectivity

## 10. Next Steps

After successful deployment:
1. Test all features thoroughly
2. Gather user feedback
3. Monitor system performance
4. Plan for mainnet deployment (if applicable)
5. Integrate real port performance APIs
6. Add more token pairs and features
