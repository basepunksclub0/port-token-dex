# 🚢 Port Token DEX

A decentralized exchange (DEX) for port performance tokens, where each token represents a major global port and is priced based on real-world port performance metrics.

## 🌟 Live Demo

**🚀 Try it now:** [https://port-token-dex.windsurf.build](https://port-token-dex.windsurf.build)

## ✨ Features

- **🔄 Token Trading** - Swap between 5 port tokens (pSINGAPORE, pDUBAI, pROTTERDAM, pSHANGHAI, pLONDON)
- **💧 Liquidity Pools** - Add/remove liquidity and earn fees
- **📊 Real-time Analytics** - Price charts, volume tracking, and performance metrics
- **👛 Portfolio Management** - Balance tracking and transaction history
- **📱 Mobile Responsive** - Perfect on all devices
- **⚡ Instant Trading** - No gas fees or network delays in demo mode

## 🚀 Quick Start

### Option 1: GitHub Pages Deployment (Recommended)

1. **Fork this repository**
2. **Enable GitHub Pages** in Settings → Pages → Deploy from branch → `main` → `/dapp/public`
3. **Your DApp will be live** at `https://yourusername.github.io/port-dex`

### Option 2: GitHub Codespaces (Full Development)

1. **Click "Code" → "Codespaces" → "Create codespace"**
2. **Wait for setup** (dependencies install automatically)
3. **Start development:**
   ```bash
   # Terminal 1 - Blockchain
   cd contracts && pnpm hardhat node
   
   # Terminal 2 - Oracle
   cd oracle && pnpm dev
   
   # Terminal 3 - Frontend  
   cd frontend && pnpm dev
   ```

### Option 3: Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/port-token-dex.git
cd port-token-dex

# Install dependencies
cd contracts && pnpm install
cd ../frontend && pnpm install  
cd ../oracle && pnpm install

# Start local blockchain
cd contracts && pnpm hardhat node

# Deploy contracts (new terminal)
cd contracts && pnpm hardhat run scripts/deploy.ts --network localhost

# Start oracle service (new terminal)
cd oracle && pnpm dev

# Start frontend (new terminal)
cd frontend && pnpm dev
```

## 📁 Project Structure

```
port-token-dex/
├── 🔗 contracts/          # Smart contracts (Hardhat)
│   ├── contracts/         # Solidity contracts
│   ├── scripts/          # Deployment scripts
│   └── test/             # Contract tests
├── 🖥️ frontend/           # Next.js frontend
│   ├── src/              # React components
│   └── public/           # Static assets
├── 🔮 oracle/             # Node.js oracle service
│   └── src/              # Oracle backend
├── 🌐 dapp/               # Standalone DApp (GitHub Pages ready)
│   └── public/           # Static HTML/CSS/JS
└── 📚 docs/               # Documentation
```

## 🛠️ Technology Stack

- **Smart Contracts:** Solidity, Hardhat, OpenZeppelin
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, Ethers.js
- **Deployment:** GitHub Pages, Netlify, Vercel
- **Development:** GitHub Codespaces, Docker

## 🎯 Token Information

| Token | Port | Country | Description |
|-------|------|---------|-------------|
| pSINGAPORE 🇸🇬 | Singapore | Singapore | World's busiest transshipment hub |
| pDUBAI 🇦🇪 | Dubai | UAE | Major Middle East gateway |
| pROTTERDAM 🇳🇱 | Rotterdam | Netherlands | Europe's largest port |
| pSHANGHAI 🇨🇳 | Shanghai | China | World's busiest container port |
| pLONDON 🇬🇧 | London | UK | Historic Thames gateway |

## 🔧 Development Commands

```bash
# Contracts
pnpm hardhat compile          # Compile contracts
pnpm hardhat test            # Run tests
pnpm hardhat node            # Start local network

# Frontend
pnpm dev                     # Start development server
pnpm build                   # Build for production
pnpm start                   # Start production server

# Oracle
pnpm dev                     # Start oracle service
pnpm build                   # Build TypeScript
```

## 🌐 Deployment Options

### GitHub Pages (Static)
- ✅ **Free hosting**
- ✅ **Automatic deployments**
- ✅ **Custom domains**
- ✅ **Global CDN**

### Vercel (Next.js)
```bash
npm i -g vercel
cd frontend && vercel --prod
```

### Netlify (Static)
```bash
npm i -g netlify-cli
cd dapp && netlify deploy --prod --dir=public
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🆘 Support

- **Documentation:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **GitHub Issues:** Report bugs and request features
- **Live Demo:** [port-token-dex.windsurf.build](https://port-token-dex.windsurf.build)

---

**Built with ❤️ for the decentralized future of port trading**
