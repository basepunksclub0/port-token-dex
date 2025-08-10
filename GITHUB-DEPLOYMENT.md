# Port Token DEX - GitHub Deployment Guide

## 🚀 Quick GitHub Pages Deployment (Recommended)

### Option 1: Deploy Standalone DApp to GitHub Pages

1. **Create a new GitHub repository**
   ```bash
   # On GitHub.com, create a new repository named 'port-token-dex'
   ```

2. **Push the DApp folder**
   ```bash
   cd dapp
   git init
   git add .
   git commit -m "Initial commit: Port Token DEX DApp"
   git branch -M main
   git remote add origin https://github.com/yourusername/port-token-dex.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

4. **Your DApp will be live at:**
   `https://yourusername.github.io/port-token-dex`

### Option 2: Deploy Full Project with GitHub Actions

1. **Push entire project to GitHub**
   ```bash
   # From port-dex root directory
   git init
   git add .
   git commit -m "Initial commit: Complete Port Token DEX"
   git branch -M main
   git remote add origin https://github.com/yourusername/port-token-dex.git
   git push -u origin main
   ```

2. **Create GitHub Actions workflow**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dapp/public
   ```

## 🔧 GitHub Codespaces Setup

### 1. Create Codespaces Configuration

Create `.devcontainer/devcontainer.json`:
```json
{
  "name": "Port Token DEX",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "postCreateCommand": "npm install -g pnpm && cd contracts && pnpm install && cd ../frontend && pnpm install && cd ../oracle && pnpm install",
  "forwardPorts": [3000, 3001, 8545],
  "portsAttributes": {
    "3000": {"label": "Frontend"},
    "3001": {"label": "Oracle"},
    "8545": {"label": "Hardhat Node"}
  }
}
```

### 2. Launch Codespace
- Go to your GitHub repository
- Click "Code" → "Codespaces" → "Create codespace on main"
- Full development environment ready in minutes!

## 🌐 Alternative Deployment Platforms

### Vercel (Next.js Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Netlify (Static DApp)
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy DApp
cd dapp
netlify deploy --prod --dir=public
```

### Railway (Full Stack)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy entire project
railway login
railway init
railway up
```

## 📋 Pre-Deployment Checklist

- ✅ **Clean .gitignore** (exclude node_modules, .env, dist)
- ✅ **Update README.md** with deployment instructions
- ✅ **Environment variables** documented
- ✅ **Build scripts** working
- ✅ **Dependencies** properly listed
- ✅ **No sensitive data** in repository

## 🎯 Recommended GitHub Repository Structure

```
port-token-dex/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .devcontainer/
│   └── devcontainer.json
├── contracts/          # Smart contracts
├── frontend/           # Next.js app
├── oracle/             # Node.js backend
├── dapp/              # Standalone version
├── docs/              # Documentation
├── README.md          # Main documentation
├── DEPLOYMENT.md      # Deployment guide
└── .gitignore         # Git ignore rules
```

## 🚀 Quick Start Commands

### Local Development
```bash
# Clone and setup
git clone https://github.com/yourusername/port-token-dex.git
cd port-token-dex

# Install dependencies
cd contracts && pnpm install
cd ../frontend && pnpm install
cd ../oracle && pnpm install

# Start development
cd contracts && pnpm hardhat node    # Terminal 1
cd oracle && pnpm dev               # Terminal 2
cd frontend && pnpm dev             # Terminal 3
```

### Quick DApp Deployment
```bash
# Just deploy the working DApp
cd dapp
# Push to GitHub and enable Pages
```

## 🎉 Your DApp Will Be Live!

Once deployed to GitHub Pages, your Port Token DEX will be accessible worldwide at:
`https://yourusername.github.io/port-token-dex`

Features available:
- ✅ Complete DEX functionality
- ✅ Real-time price updates
- ✅ Token trading simulation
- ✅ Liquidity pool management
- ✅ Analytics dashboard
- ✅ Portfolio tracking
- ✅ Mobile responsive design
