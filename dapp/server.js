const express = require('express');
const path = require('path');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock blockchain data
let tokens = {
  pSINGAPORE: {
    name: 'Port Singapore Token',
    symbol: 'pSINGAPORE',
    price: 1.25,
    change24h: 2.4,
    performance: 85,
    volume: 2400000,
    flag: 'sg',
    country: 'Singapore'
  },
  pDUBAI: {
    name: 'Port Dubai Token',
    symbol: 'pDUBAI',
    price: 1.18,
    change24h: 1.8,
    performance: 78,
    volume: 1800000,
    flag: 'ae',
    country: 'Dubai'
  },
  pROTTERDAM: {
    name: 'Port Rotterdam Token',
    symbol: 'pROTTERDAM',
    price: 1.12,
    change24h: -0.5,
    performance: 72,
    volume: 1200000,
    flag: 'nl',
    country: 'Netherlands'
  },
  pSHANGHAI: {
    name: 'Port Shanghai Token',
    symbol: 'pSHANGHAI',
    price: 1.32,
    change24h: 3.2,
    performance: 88,
    volume: 3100000,
    flag: 'cn',
    country: 'China'
  },
  pLA: {
    name: 'Port Los Angeles Token',
    symbol: 'pLA',
    price: 1.08,
    change24h: -1.2,
    performance: 65,
    volume: 950000,
    flag: 'us',
    country: 'United States'
  }
};

let liquidityPools = {
  'pSINGAPORE-pDUBAI': {
    tokenA: 'pSINGAPORE',
    tokenB: 'pDUBAI',
    reserveA: 100000,
    reserveB: 105000,
    totalLiquidity: 1250000,
    apy: 12.5
  },
  'pSINGAPORE-pSHANGHAI': {
    tokenA: 'pSINGAPORE',
    tokenB: 'pSHANGHAI',
    reserveA: 80000,
    reserveB: 75000,
    totalLiquidity: 980000,
    apy: 15.2
  }
};

let userBalances = {
  'demo-wallet': {
    ETH: 5.0,
    pSINGAPORE: 1000,
    pDUBAI: 800,
    pROTTERDAM: 600,
    pSHANGHAI: 1200,
    pLA: 500
  }
};

let transactions = [];
let priceHistory = {};

// Initialize price history
Object.keys(tokens).forEach(token => {
  priceHistory[token] = generatePriceHistory(tokens[token].price);
});

function generatePriceHistory(basePrice) {
  const history = [];
  const now = Date.now();
  for (let i = 30; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const variation = (Math.random() - 0.5) * 0.1;
    const price = basePrice * (1 + variation);
    history.push({ timestamp, price });
  }
  return history;
}

// API Routes
app.get('/api/tokens', (req, res) => {
  res.json(tokens);
});

app.get('/api/tokens/:symbol', (req, res) => {
  const token = tokens[req.params.symbol];
  if (!token) {
    return res.status(404).json({ error: 'Token not found' });
  }
  res.json(token);
});

app.get('/api/pools', (req, res) => {
  res.json(liquidityPools);
});

app.get('/api/balances/:wallet', (req, res) => {
  const balances = userBalances[req.params.wallet] || {};
  res.json(balances);
});

app.get('/api/price-history/:symbol', (req, res) => {
  const history = priceHistory[req.params.symbol] || [];
  res.json(history);
});

app.get('/api/transactions/:wallet', (req, res) => {
  const walletTxs = transactions.filter(tx => tx.wallet === req.params.wallet);
  res.json(walletTxs);
});

// Trading endpoint
app.post('/api/swap', (req, res) => {
  const { fromToken, toToken, amount, wallet } = req.body;
  
  if (!userBalances[wallet]) {
    userBalances[wallet] = { ETH: 0 };
  }
  
  const userBalance = userBalances[wallet][fromToken] || 0;
  if (userBalance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  // Calculate exchange rate (simplified)
  let exchangeRate = 1;
  if (fromToken === 'ETH') {
    exchangeRate = 800; // 1 ETH = 800 tokens
  } else if (toToken === 'ETH') {
    exchangeRate = 1/800; // 800 tokens = 1 ETH
  } else {
    const fromPrice = tokens[fromToken]?.price || 1;
    const toPrice = tokens[toToken]?.price || 1;
    exchangeRate = fromPrice / toPrice;
  }
  
  const outputAmount = amount * exchangeRate * 0.997; // 0.3% fee
  
  // Update balances
  userBalances[wallet][fromToken] = (userBalances[wallet][fromToken] || 0) - amount;
  userBalances[wallet][toToken] = (userBalances[wallet][toToken] || 0) + outputAmount;
  
  // Record transaction
  const transaction = {
    id: Date.now().toString(),
    wallet,
    type: 'swap',
    fromToken,
    toToken,
    fromAmount: amount,
    toAmount: outputAmount,
    timestamp: Date.now(),
    status: 'completed',
    hash: '0x' + Math.random().toString(16).substr(2, 64)
  };
  
  transactions.push(transaction);
  
  // Broadcast to WebSocket clients
  broadcast({
    type: 'transaction',
    data: transaction
  });
  
  res.json({
    success: true,
    transaction,
    newBalances: userBalances[wallet]
  });
});

// Add liquidity endpoint
app.post('/api/add-liquidity', (req, res) => {
  const { tokenA, tokenB, amountA, amountB, wallet } = req.body;
  
  if (!userBalances[wallet]) {
    return res.status(400).json({ error: 'Wallet not found' });
  }
  
  const balanceA = userBalances[wallet][tokenA] || 0;
  const balanceB = userBalances[wallet][tokenB] || 0;
  
  if (balanceA < amountA || balanceB < amountB) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  // Update balances
  userBalances[wallet][tokenA] -= amountA;
  userBalances[wallet][tokenB] -= amountB;
  
  // Update pool
  const poolKey = `${tokenA}-${tokenB}`;
  if (!liquidityPools[poolKey]) {
    liquidityPools[poolKey] = {
      tokenA,
      tokenB,
      reserveA: 0,
      reserveB: 0,
      totalLiquidity: 0,
      apy: Math.random() * 20 + 5
    };
  }
  
  liquidityPools[poolKey].reserveA += amountA;
  liquidityPools[poolKey].reserveB += amountB;
  liquidityPools[poolKey].totalLiquidity += (amountA + amountB) * 1.2;
  
  const transaction = {
    id: Date.now().toString(),
    wallet,
    type: 'add-liquidity',
    tokenA,
    tokenB,
    amountA,
    amountB,
    timestamp: Date.now(),
    status: 'completed',
    hash: '0x' + Math.random().toString(16).substr(2, 64)
  };
  
  transactions.push(transaction);
  
  broadcast({
    type: 'liquidity-added',
    data: { transaction, pool: liquidityPools[poolKey] }
  });
  
  res.json({
    success: true,
    transaction,
    pool: liquidityPools[poolKey],
    newBalances: userBalances[wallet]
  });
});

// WebSocket handling
function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        ws.send(JSON.stringify({
          type: 'initial-data',
          tokens,
          pools: liquidityPools
        }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Price update simulation
setInterval(() => {
  Object.keys(tokens).forEach(symbol => {
    const variation = (Math.random() - 0.5) * 0.02; // ±2% variation
    tokens[symbol].price *= (1 + variation);
    tokens[symbol].change24h = (Math.random() - 0.5) * 10; // ±5% daily change
    
    // Update price history
    priceHistory[symbol].push({
      timestamp: Date.now(),
      price: tokens[symbol].price
    });
    
    // Keep only last 30 days
    if (priceHistory[symbol].length > 30) {
      priceHistory[symbol].shift();
    }
  });
  
  broadcast({
    type: 'price-update',
    data: tokens
  });
}, 10000); // Update every 10 seconds

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Port Token DEX DApp running on http://localhost:${PORT}`);
  console.log(`📊 WebSocket server ready for real-time updates`);
  console.log(`⚓ All port tokens loaded and ready for trading!`);
});
