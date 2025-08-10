'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { PORT_TOKENS, CONTRACT_ADDRESSES, ABIS } from '@/config/contracts';
import { ethers } from 'ethers';

interface TokenData {
  symbol: string;
  name: string;
  icon: string;
  price: string;
  change24h: string;
  performance: string;
  balance: string;
  address: string;
}

const HomePage: React.FC = () => {
  const { provider, account, isConnected } = useWeb3();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && provider) {
      loadTokenData();
    }
  }, [isConnected, provider, account]);

  const loadTokenData = async () => {
    try {
      setLoading(true);
      setError(null);

      const oracleContract = new ethers.Contract(
        CONTRACT_ADDRESSES.oracle,
        ABIS.PortOracle,
        provider
      );

      const tokenDataPromises = PORT_TOKENS.map(async (token) => {
        try {
          // Get oracle data
          const [performanceIndex, lastUpdated, isActive] = await oracleContract.getPortData(token.portName);
          
          // Get user balance if connected
          let balance = '0';
          if (account && token.address) {
            const tokenContract = new ethers.Contract(token.address, ABIS.ERC20, provider);
            const balanceWei = await tokenContract.balanceOf(account);
            balance = ethers.formatEther(balanceWei);
          }

          // Mock price calculation based on performance
          const basePrice = 100; // Base price in USD
          const performanceMultiplier = Number(performanceIndex) / 5000; // Normalize around 1.0
          const price = (basePrice * performanceMultiplier).toFixed(2);

          // Mock 24h change (random for demo)
          const change24h = (Math.random() * 20 - 10).toFixed(2);

          return {
            symbol: token.symbol,
            name: token.name,
            icon: token.icon,
            price: `$${price}`,
            change24h: `${change24h}%`,
            performance: `${(Number(performanceIndex) / 100).toFixed(1)}%`,
            balance: parseFloat(balance).toFixed(4),
            address: token.address,
          };
        } catch (err) {
          console.error(`Error loading data for ${token.symbol}:`, err);
          return {
            symbol: token.symbol,
            name: token.name,
            icon: token.icon,
            price: '$0.00',
            change24h: '0.00%',
            performance: '0.0%',
            balance: '0.0000',
            address: token.address,
          };
        }
      });

      const tokenData = await Promise.all(tokenDataPromises);
      setTokens(tokenData);
    } catch (err) {
      console.error('Error loading token data:', err);
      setError('Failed to load token data');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🚢</div>
        <h1 className="text-4xl font-bold mb-4">Port Token DEX</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Trade port tokens backed by real-world performance data
        </p>
        <p className="text-gray-500 dark:text-gray-500">
          Connect your wallet to start trading
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p>Loading port token data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={loadTokenData} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Port Token Markets</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Trade tokens representing global ports, priced by real-world performance
        </p>
      </div>

      <div className="grid gap-4">
        {/* Header */}
        <div className="grid grid-cols-7 gap-4 px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          <div>Token</div>
          <div>Price</div>
          <div>24h Change</div>
          <div>Performance</div>
          <div>Your Balance</div>
          <div>Actions</div>
          <div></div>
        </div>

        {/* Token rows */}
        {tokens.map((token) => (
          <div key={token.symbol} className="card">
            <div className="grid grid-cols-7 gap-4 items-center">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{token.icon}</div>
                <div>
                  <div className="font-semibold">{token.symbol}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{token.name}</div>
                </div>
              </div>
              
              <div className="font-semibold">{token.price}</div>
              
              <div className={`font-medium ${
                token.change24h.startsWith('-') 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {token.change24h}
              </div>
              
              <div className="font-medium text-primary-600 dark:text-primary-400">
                {token.performance}
              </div>
              
              <div className="font-mono text-sm">
                {token.balance} {token.symbol}
              </div>
              
              <div className="flex space-x-2">
                <button className="btn-primary text-sm px-3 py-1">
                  Trade
                </button>
                <button className="btn-secondary text-sm px-3 py-1">
                  Add Liquidity
                </button>
              </div>
              
              <div></div>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh button */}
      <div className="text-center">
        <button onClick={loadTokenData} className="btn-secondary">
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default HomePage;
