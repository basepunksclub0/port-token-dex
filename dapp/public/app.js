// DApp State
let currentWallet = null;
let tokens = {};
let pools = {};
let balances = {};
let transactions = [];
let ws = null;
let priceChart = null;
let volumeChart = null;
let portfolioChart = null;

// Initialize DApp
document.addEventListener('DOMContentLoaded', function() {
    initializeWebSocket();
    loadTokens();
    setupEventListeners();
    initializeCharts();
    
    // Auto-connect demo wallet
    setTimeout(() => {
        connectDemoWallet();
    }, 1000);
});

// Mock WebSocket Connection for static deployment
function initializeWebSocket() {
    console.log('Static mode - using mock data');
    updateConnectionStatus(true);
    
    // Initialize with mock data
    initializeMockData();
    
    // Simulate real-time price updates
    setInterval(() => {
        updateMockPrices();
        updateTokenDisplay();
        updatePriceChart();
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    }, 10000); // Update every 10 seconds
}

function handleWebSocketMessage(data) {
    switch(data.type) {
        case 'initial-data':
            tokens = data.tokens;
            pools = data.pools;
            updateTokenDisplay();
            updatePoolsDisplay();
            break;
        case 'price-update':
            tokens = data.data;
            updateTokenDisplay();
            updatePriceChart();
            showToast('Prices updated', 'success');
            break;
        case 'transaction':
            if (data.data.wallet === currentWallet) {
                transactions.unshift(data.data);
                updateTransactionHistory();
                showToast(`Transaction completed: ${data.data.type}`, 'success');
            }
            break;
        case 'liquidity-added':
            if (data.data.transaction.wallet === currentWallet) {
                pools = { ...pools, [data.data.pool.tokenA + '-' + data.data.pool.tokenB]: data.data.pool };
                updatePoolsDisplay();
            }
            break;
    }
    
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
}

function updateConnectionStatus(connected) {
    const statusItems = document.querySelectorAll('.status-online');
    statusItems.forEach(item => {
        item.className = connected ? 'fas fa-circle status-online' : 'fas fa-circle status-offline';
        item.style.color = connected ? '#10b981' : '#ef4444';
    });
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Wallet connection
    document.getElementById('connectWallet').addEventListener('click', connectDemoWallet);
    
    // Trade inputs
    document.getElementById('fromAmount').addEventListener('input', calculateSwapOutput);
    document.getElementById('fromToken').addEventListener('change', calculateSwapOutput);
    document.getElementById('toToken').addEventListener('change', calculateSwapOutput);
    
    // Chart controls
    document.getElementById('chartToken').addEventListener('change', updatePriceChart);
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updatePriceChart();
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Update charts when analytics section is shown
    if (sectionId === 'analytics') {
        setTimeout(() => {
            updatePriceChart();
            updateVolumeChart();
        }, 100);
    }
    
    // Update portfolio when portfolio section is shown
    if (sectionId === 'portfolio') {
        setTimeout(() => {
            updatePortfolio();
            updatePortfolioChart();
        }, 100);
    }
}

// Wallet Functions
function connectDemoWallet() {
    currentWallet = 'demo-wallet';
    
    document.getElementById('walletText').textContent = 'Demo Wallet';
    document.getElementById('connectWallet').classList.add('connected');
    
    loadBalances();
    loadTransactions();
    updateSwapButton();
    updateLiquidityButton();
    
    showToast('Demo wallet connected successfully!', 'success');
}

async function loadBalances() {
    if (!currentWallet) return;
    
    // Static deployment - balances already initialized
    updateBalanceDisplays();
}

function updateBalanceDisplays() {
    // Update swap balances
    const fromToken = document.getElementById('fromToken').value;
    const toToken = document.getElementById('toToken').value;
    
    document.getElementById('fromBalance').textContent = (balances[fromToken] || 0).toFixed(4);
    document.getElementById('toBalance').textContent = (balances[toToken] || 0).toFixed(4);
    
    // Update liquidity balances
    const liquidityTokenA = document.getElementById('liquidityTokenA').value;
    const liquidityTokenB = document.getElementById('liquidityTokenB').value;
    
    if (liquidityTokenA) {
        document.getElementById('liquidityBalanceA').textContent = (balances[liquidityTokenA] || 0).toFixed(4);
    }
    if (liquidityTokenB) {
        document.getElementById('liquidityBalanceB').textContent = (balances[liquidityTokenB] || 0).toFixed(4);
    }
}

// Initialize mock data for static deployment
function initializeMockData() {
    tokens = {
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
    
    pools = {
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
    
    balances = {
        ETH: 5.0,
        pSINGAPORE: 1000,
        pDUBAI: 800,
        pROTTERDAM: 600,
        pSHANGHAI: 1200,
        pLA: 500
    };
    
    updateTokenDisplay();
    populateTokenSelects();
    updatePoolsDisplay();
}

function updateMockPrices() {
    Object.keys(tokens).forEach(symbol => {
        const variation = (Math.random() - 0.5) * 0.02; // ±2% variation
        tokens[symbol].price *= (1 + variation);
        tokens[symbol].change24h = (Math.random() - 0.5) * 10; // ±5% daily change
    });
}

// Token Functions
async function loadTokens() {
    // Static deployment - data already loaded in initializeMockData
    console.log('Using mock token data for static deployment');
}

function updateTokenDisplay() {
    const tokenGrid = document.getElementById('tokenGrid');
    if (!tokenGrid) return;
    
    tokenGrid.innerHTML = '';
    
    Object.values(tokens).forEach(token => {
        const tokenCard = createTokenCard(token);
        tokenGrid.appendChild(tokenCard);
    });
    
    updateHeroStats();
}

function createTokenCard(token) {
    const card = document.createElement('div');
    card.className = 'token-card';
    card.innerHTML = `
        <div class="token-header">
            <div class="token-info">
                <img src="https://flagcdn.com/w40/${token.flag}.png" alt="${token.country}" class="flag">
                <div>
                    <h3>${token.symbol}</h3>
                    <p>${token.name}</p>
                </div>
            </div>
            <div class="token-price">
                <span class="price">$${token.price.toFixed(4)}</span>
                <span class="change ${token.change24h >= 0 ? 'positive' : 'negative'}">
                    ${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(1)}%
                </span>
            </div>
        </div>
        <div class="token-stats">
            <div class="stat">
                <span>Performance</span>
                <span class="performance">${token.performance}%</span>
            </div>
            <div class="stat">
                <span>Volume</span>
                <span>$${formatNumber(token.volume)}</span>
            </div>
        </div>
        <button class="trade-btn" onclick="openTrade('${token.symbol}')">
            <i class="fas fa-exchange-alt"></i>
            Trade ${token.symbol}
        </button>
    `;
    return card;
}

function populateTokenSelects() {
    const selects = ['fromToken', 'toToken', 'liquidityTokenA', 'liquidityTokenB', 'chartToken'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Clear existing options except ETH
        if (selectId === 'fromToken' || selectId === 'toToken') {
            select.innerHTML = selectId === 'fromToken' ? '<option value="ETH">ETH</option>' : '';
        } else {
            select.innerHTML = '';
        }
        
        Object.values(tokens).forEach(token => {
            const option = document.createElement('option');
            option.value = token.symbol;
            option.textContent = token.symbol;
            select.appendChild(option);
        });
    });
}

function openTrade(tokenSymbol) {
    document.getElementById('toToken').value = tokenSymbol;
    showSection('trade');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="trade"]').classList.add('active');
    calculateSwapOutput();
}

// Trading Functions
function calculateSwapOutput() {
    const fromAmount = parseFloat(document.getElementById('fromAmount').value) || 0;
    const fromToken = document.getElementById('fromToken').value;
    const toToken = document.getElementById('toToken').value;
    
    if (fromAmount === 0 || fromToken === toToken) {
        document.getElementById('toAmount').value = '';
        document.getElementById('exchangeRate').textContent = '1 ETH = 800 tokens';
        document.getElementById('minReceived').textContent = '0.00';
        return;
    }
    
    let exchangeRate = 1;
    if (fromToken === 'ETH') {
        exchangeRate = 800;
    } else if (toToken === 'ETH') {
        exchangeRate = 1/800;
    } else if (tokens[fromToken] && tokens[toToken]) {
        exchangeRate = tokens[fromToken].price / tokens[toToken].price;
    }
    
    const outputAmount = fromAmount * exchangeRate * 0.997; // 0.3% fee
    const minReceived = outputAmount * 0.995; // 0.5% slippage
    
    document.getElementById('toAmount').value = outputAmount.toFixed(6);
    document.getElementById('exchangeRate').textContent = `1 ${fromToken} = ${exchangeRate.toFixed(2)} ${toToken}`;
    document.getElementById('minReceived').textContent = minReceived.toFixed(6);
    
    updateBalanceDisplays();
}

function swapTokens() {
    const fromToken = document.getElementById('fromToken').value;
    const toToken = document.getElementById('toToken').value;
    const fromAmount = document.getElementById('fromAmount').value;
    const toAmount = document.getElementById('toAmount').value;
    
    document.getElementById('fromToken').value = toToken;
    document.getElementById('toToken').value = fromToken;
    document.getElementById('fromAmount').value = toAmount;
    
    calculateSwapOutput();
}

async function executeSwap() {
    if (!currentWallet) {
        showToast('Please connect your wallet first', 'error');
        return;
    }
    
    const fromToken = document.getElementById('fromToken').value;
    const toToken = document.getElementById('toToken').value;
    const amount = parseFloat(document.getElementById('fromAmount').value);
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    if ((balances[fromToken] || 0) < amount) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    showLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
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
        balances[fromToken] = (balances[fromToken] || 0) - amount;
        balances[toToken] = (balances[toToken] || 0) + outputAmount;
        
        // Create transaction record
        const transaction = {
            id: Date.now().toString(),
            wallet: currentWallet,
            type: 'swap',
            fromToken,
            toToken,
            fromAmount: amount,
            toAmount: outputAmount,
            timestamp: Date.now(),
            status: 'completed',
            hash: '0x' + Math.random().toString(16).substr(2, 64)
        };
        
        transactions.unshift(transaction);
        
        updateBalanceDisplays();
        updateTransactionHistory();
        document.getElementById('fromAmount').value = '';
        document.getElementById('toAmount').value = '';
        showToast(`Swapped ${amount} ${fromToken} for ${outputAmount.toFixed(4)} ${toToken}`, 'success');
        showLoading(false);
    }, 1500);
}

function updateSwapButton() {
    const swapBtn = document.getElementById('swapBtn');
    if (currentWallet) {
        swapBtn.innerHTML = '<i class="fas fa-exchange-alt"></i><span>Swap Tokens</span>';
        swapBtn.disabled = false;
    } else {
        swapBtn.innerHTML = '<i class="fas fa-wallet"></i><span>Connect Wallet to Trade</span>';
        swapBtn.disabled = true;
    }
}

// Liquidity Functions
async function addLiquidity() {
    if (!currentWallet) {
        showToast('Please connect your wallet first', 'error');
        return;
    }
    
    const tokenA = document.getElementById('liquidityTokenA').value;
    const tokenB = document.getElementById('liquidityTokenB').value;
    const amountA = parseFloat(document.getElementById('liquidityAmountA').value);
    const amountB = parseFloat(document.getElementById('liquidityAmountB').value);
    
    if (!amountA || !amountB || amountA <= 0 || amountB <= 0) {
        showToast('Please enter valid amounts for both tokens', 'error');
        return;
    }
    
    if ((balances[tokenA] || 0) < amountA || (balances[tokenB] || 0) < amountB) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    showLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
        // Update balances
        balances[tokenA] = (balances[tokenA] || 0) - amountA;
        balances[tokenB] = (balances[tokenB] || 0) - amountB;
        
        // Update pool
        const poolKey = `${tokenA}-${tokenB}`;
        if (!pools[poolKey]) {
            pools[poolKey] = {
                tokenA,
                tokenB,
                reserveA: 0,
                reserveB: 0,
                totalLiquidity: 0,
                apy: Math.random() * 20 + 5
            };
        }
        
        pools[poolKey].reserveA += amountA;
        pools[poolKey].reserveB += amountB;
        pools[poolKey].totalLiquidity += (amountA + amountB) * 1.2;
        
        // Create transaction record
        const transaction = {
            id: Date.now().toString(),
            wallet: currentWallet,
            type: 'add-liquidity',
            tokenA,
            tokenB,
            amountA,
            amountB,
            timestamp: Date.now(),
            status: 'completed',
            hash: '0x' + Math.random().toString(16).substr(2, 64)
        };
        
        transactions.unshift(transaction);
        
        updateBalanceDisplays();
        updatePoolsDisplay();
        updateTransactionHistory();
        document.getElementById('liquidityAmountA').value = '';
        document.getElementById('liquidityAmountB').value = '';
        showToast(`Added liquidity: ${amountA} ${tokenA} + ${amountB} ${tokenB}`, 'success');
        showLoading(false);
    }, 1500);
}

function updateLiquidityButton() {
    const liquidityBtn = document.getElementById('addLiquidityBtn');
    if (currentWallet) {
        liquidityBtn.textContent = 'Add Liquidity';
        liquidityBtn.disabled = false;
    } else {
        liquidityBtn.textContent = 'Connect Wallet';
        liquidityBtn.disabled = true;
    }
}

async function updatePoolsDisplay() {
    const poolsList = document.getElementById('poolsList');
    if (!poolsList) return;
    
    poolsList.innerHTML = '';
    
    Object.values(pools).forEach(pool => {
        const poolItem = document.createElement('div');
        poolItem.className = 'pool-item';
        poolItem.innerHTML = `
            <div class="pool-info">
                <div class="pool-pair">
                    <strong>${pool.tokenA}/${pool.tokenB}</strong>
                </div>
                <div class="pool-stats">
                    <span>TVL: $${formatNumber(pool.totalLiquidity)}</span>
                    <span>APY: ${pool.apy.toFixed(1)}%</span>
                </div>
            </div>
            <div class="pool-actions">
                <button class="pool-btn" onclick="selectPool('${pool.tokenA}', '${pool.tokenB}')">
                    Add Liquidity
                </button>
            </div>
        `;
        poolsList.appendChild(poolItem);
    });
}

function selectPool(tokenA, tokenB) {
    document.getElementById('liquidityTokenA').value = tokenA;
    document.getElementById('liquidityTokenB').value = tokenB;
    updateBalanceDisplays();
}

// Chart Functions
function initializeCharts() {
    const ctx1 = document.getElementById('priceChart');
    const ctx2 = document.getElementById('volumeChart');
    const ctx3 = document.getElementById('portfolioChart');
    
    if (ctx1) {
        priceChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price',
                    data: [],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }
    
    if (ctx2) {
        volumeChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Volume',
                    data: [],
                    backgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    if (ctx3) {
        portfolioChart = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#4f46e5',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

async function updatePriceChart() {
    if (!priceChart) return;
    
    const selectedToken = document.getElementById('chartToken').value;
    if (!selectedToken || !tokens[selectedToken]) return;
    
    // Generate mock price history for static deployment
    const history = [];
    const basePrice = tokens[selectedToken].price;
    const now = Date.now();
    
    for (let i = 30; i >= 0; i--) {
        const timestamp = now - (i * 24 * 60 * 60 * 1000);
        const variation = (Math.random() - 0.5) * 0.1;
        const price = basePrice * (1 + variation);
        history.push({ timestamp, price });
    }
    
    const labels = history.map(h => new Date(h.timestamp).toLocaleDateString());
    const prices = history.map(h => h.price);
    
    priceChart.data.labels = labels;
    priceChart.data.datasets[0].data = prices;
    priceChart.data.datasets[0].label = `${selectedToken} Price`;
    priceChart.update();
}

function updateVolumeChart() {
    if (!volumeChart) return;
    
    const labels = Object.keys(tokens);
    const volumes = Object.values(tokens).map(t => t.volume);
    
    volumeChart.data.labels = labels;
    volumeChart.data.datasets[0].data = volumes;
    volumeChart.update();
}

function updatePortfolioChart() {
    if (!portfolioChart || !currentWallet) return;
    
    const labels = Object.keys(balances);
    const values = labels.map(token => {
        const balance = balances[token] || 0;
        const price = token === 'ETH' ? 2000 : (tokens[token]?.price || 0);
        return balance * price;
    });
    
    portfolioChart.data.labels = labels;
    portfolioChart.data.datasets[0].data = values;
    portfolioChart.update();
}

// Portfolio Functions
function updatePortfolio() {
    if (!currentWallet) return;
    
    const holdingsList = document.getElementById('holdingsList');
    if (!holdingsList) return;
    
    holdingsList.innerHTML = '';
    
    let totalValue = 0;
    
    Object.entries(balances).forEach(([token, balance]) => {
        if (balance > 0) {
            const price = token === 'ETH' ? 2000 : (tokens[token]?.price || 0);
            const value = balance * price;
            totalValue += value;
            
            const holdingItem = document.createElement('div');
            holdingItem.className = 'holding-item';
            holdingItem.innerHTML = `
                <div class="holding-info">
                    <strong>${token}</strong>
                    <span>${balance.toFixed(4)} tokens</span>
                </div>
                <div class="holding-value">
                    <strong>$${value.toFixed(2)}</strong>
                </div>
            `;
            holdingsList.appendChild(holdingItem);
        }
    });
    
    document.getElementById('portfolioValue').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('portfolioChange').textContent = '+0.00%';
    document.getElementById('portfolioChange').className = 'change neutral';
}

async function loadTransactions() {
    if (!currentWallet) return;
    
    // Static deployment - transactions initialized as empty array
    updateTransactionHistory();
}

function updateTransactionHistory() {
    const transactionsList = document.getElementById('transactionsList');
    const recentTrades = document.getElementById('recentTrades');
    
    if (transactionsList) {
        transactionsList.innerHTML = '';
        
        transactions.slice(0, 10).forEach(tx => {
            const txItem = document.createElement('div');
            txItem.className = 'transaction-item';
            txItem.innerHTML = `
                <div class="tx-info">
                    <strong>${tx.type.toUpperCase()}</strong>
                    <span>${new Date(tx.timestamp).toLocaleString()}</span>
                </div>
                <div class="tx-details">
                    ${tx.type === 'swap' ? 
                        `${tx.fromAmount.toFixed(4)} ${tx.fromToken} → ${tx.toAmount.toFixed(4)} ${tx.toToken}` :
                        `${tx.amountA.toFixed(4)} ${tx.tokenA} + ${tx.amountB.toFixed(4)} ${tx.tokenB}`
                    }
                </div>
            `;
            transactionsList.appendChild(txItem);
        });
    }
    
    if (recentTrades) {
        recentTrades.innerHTML = '';
        
        transactions.filter(tx => tx.type === 'swap').slice(0, 5).forEach(tx => {
            const tradeItem = document.createElement('div');
            tradeItem.className = 'trade-item';
            tradeItem.innerHTML = `
                <div class="trade-info">
                    <span>${tx.fromToken} → ${tx.toToken}</span>
                    <span class="trade-time">${new Date(tx.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="trade-amount">
                    ${tx.fromAmount.toFixed(4)} → ${tx.toAmount.toFixed(4)}
                </div>
            `;
            recentTrades.appendChild(tradeItem);
        });
    }
}

// Utility Functions
function updateHeroStats() {
    const totalVolume = Object.values(tokens).reduce((sum, token) => sum + token.volume, 0);
    const totalLiquidity = Object.values(pools).reduce((sum, pool) => sum + pool.totalLiquidity, 0);
    const activePairs = Object.keys(tokens).length;
    
    document.getElementById('totalVolume').textContent = `$${formatNumber(totalVolume)}`;
    document.getElementById('totalLiquidity').textContent = `$${formatNumber(totalLiquidity)}`;
    document.getElementById('activePairs').textContent = activePairs.toString();
    
    // Update analytics stats
    document.getElementById('analyticsVolume').textContent = `$${formatNumber(totalVolume)}`;
    document.getElementById('analyticsLiquidity').textContent = `$${formatNumber(totalLiquidity)}`;
    document.getElementById('analyticsTrades').textContent = transactions.length.toString();
    document.getElementById('analyticsTokens').textContent = activePairs.toString();
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}
