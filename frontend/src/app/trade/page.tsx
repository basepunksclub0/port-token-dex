'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { PORT_TOKENS, CONTRACT_ADDRESSES, ABIS } from '@/config/contracts';
import { ethers } from 'ethers';

interface SwapState {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  slippage: string;
  gasEstimate: string;
}

const TradePage: React.FC = () => {
  const { provider, signer, account, isConnected } = useWeb3();
  const [swapState, setSwapState] = useState<SwapState>({
    tokenIn: PORT_TOKENS[0]?.symbol || '',
    tokenOut: PORT_TOKENS[1]?.symbol || '',
    amountIn: '',
    amountOut: '',
    slippage: '0.5',
    gasEstimate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isConnected && provider && account) {
      loadBalances();
    }
  }, [isConnected, provider, account]);

  useEffect(() => {
    if (swapState.amountIn && swapState.tokenIn && swapState.tokenOut) {
      calculateAmountOut();
    }
  }, [swapState.amountIn, swapState.tokenIn, swapState.tokenOut]);

  const loadBalances = async () => {
    try {
      const balancePromises = PORT_TOKENS.map(async (token) => {
        if (!token.address) return { symbol: token.symbol, balance: '0' };
        
        const tokenContract = new ethers.Contract(token.address, ABIS.ERC20, provider);
        const balance = await tokenContract.balanceOf(account);
        return {
          symbol: token.symbol,
          balance: ethers.formatEther(balance),
        };
      });

      const results = await Promise.all(balancePromises);
      const balanceMap = results.reduce((acc, { symbol, balance }) => {
        acc[symbol] = balance;
        return acc;
      }, {} as Record<string, string>);

      setBalances(balanceMap);
    } catch (err) {
      console.error('Error loading balances:', err);
    }
  };

  const calculateAmountOut = async () => {
    try {
      if (!provider || !swapState.amountIn) return;

      const tokenInData = PORT_TOKENS.find(t => t.symbol === swapState.tokenIn);
      const tokenOutData = PORT_TOKENS.find(t => t.symbol === swapState.tokenOut);
      
      if (!tokenInData?.address || !tokenOutData?.address) return;

      const dexContract = new ethers.Contract(CONTRACT_ADDRESSES.dex, ABIS.PortDEX, provider);
      const [reserveIn, reserveOut] = await dexContract.getReserves(tokenInData.address, tokenOutData.address);
      
      if (reserveIn > 0 && reserveOut > 0) {
        const amountInWei = ethers.parseEther(swapState.amountIn);
        const amountOutWei = await dexContract.getAmountOut(amountInWei, reserveIn, reserveOut);
        const amountOut = ethers.formatEther(amountOutWei);
        
        setSwapState(prev => ({ ...prev, amountOut }));
      }
    } catch (err) {
      console.error('Error calculating amount out:', err);
    }
  };

  const estimateGas = async () => {
    try {
      if (!signer || !swapState.amountIn || !swapState.tokenIn || !swapState.tokenOut) return;

      const tokenInData = PORT_TOKENS.find(t => t.symbol === swapState.tokenIn);
      const tokenOutData = PORT_TOKENS.find(t => t.symbol === swapState.tokenOut);
      
      if (!tokenInData?.address || !tokenOutData?.address) return;

      const dexContract = new ethers.Contract(CONTRACT_ADDRESSES.dex, ABIS.PortDEX, signer);
      const amountInWei = ethers.parseEther(swapState.amountIn);
      const minAmountOut = ethers.parseEther((parseFloat(swapState.amountOut) * (1 - parseFloat(swapState.slippage) / 100)).toString());

      const gasEstimate = await dexContract.swap.estimateGas(
        tokenInData.address,
        tokenOutData.address,
        amountInWei,
        minAmountOut
      );

      const gasPrice = await provider?.getFeeData();
      const gasCost = gasEstimate * (gasPrice?.gasPrice || 0n);
      
      setSwapState(prev => ({ 
        ...prev, 
        gasEstimate: `${ethers.formatEther(gasCost)} ETH` 
      }));
    } catch (err) {
      console.error('Error estimating gas:', err);
    }
  };

  const handleSwap = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!signer || !swapState.amountIn || !swapState.tokenIn || !swapState.tokenOut) {
        throw new Error('Missing required data for swap');
      }

      const tokenInData = PORT_TOKENS.find(t => t.symbol === swapState.tokenIn);
      const tokenOutData = PORT_TOKENS.find(t => t.symbol === swapState.tokenOut);
      
      if (!tokenInData?.address || !tokenOutData?.address) {
        throw new Error('Token addresses not found');
      }

      // Approve token spending
      const tokenContract = new ethers.Contract(tokenInData.address, ABIS.ERC20, signer);
      const amountInWei = ethers.parseEther(swapState.amountIn);
      
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.dex, amountInWei);
      await approveTx.wait();

      // Execute swap
      const dexContract = new ethers.Contract(CONTRACT_ADDRESSES.dex, ABIS.PortDEX, signer);
      const minAmountOut = ethers.parseEther((parseFloat(swapState.amountOut) * (1 - parseFloat(swapState.slippage) / 100)).toString());

      const swapTx = await dexContract.swap(
        tokenInData.address,
        tokenOutData.address,
        amountInWei,
        minAmountOut
      );

      await swapTx.wait();
      
      // Refresh balances
      await loadBalances();
      
      // Reset form
      setSwapState(prev => ({ ...prev, amountIn: '', amountOut: '' }));
      
    } catch (err: any) {
      console.error('Swap failed:', err);
      setError(err.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  const swapTokens = () => {
    setSwapState(prev => ({
      ...prev,
      tokenIn: prev.tokenOut,
      tokenOut: prev.tokenIn,
      amountIn: prev.amountOut,
      amountOut: prev.amountIn,
    }));
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Trade Port Tokens</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to start trading
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Trade</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Swap port tokens instantly
        </p>
      </div>

      <div className="card space-y-4">
        {/* Token In */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">From</label>
            <span className="text-xs text-gray-500">
              Balance: {balances[swapState.tokenIn] || '0'} {swapState.tokenIn}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <select
              value={swapState.tokenIn}
              onChange={(e) => setSwapState(prev => ({ ...prev, tokenIn: e.target.value }))}
              className="input-field w-32"
            >
              {PORT_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              value={swapState.amountIn}
              onChange={(e) => setSwapState(prev => ({ ...prev, amountIn: e.target.value }))}
              placeholder="0.0"
              className="input-field flex-1"
            />
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <button
            onClick={swapTokens}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ⇅
          </button>
        </div>

        {/* Token Out */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">To</label>
            <span className="text-xs text-gray-500">
              Balance: {balances[swapState.tokenOut] || '0'} {swapState.tokenOut}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <select
              value={swapState.tokenOut}
              onChange={(e) => setSwapState(prev => ({ ...prev, tokenOut: e.target.value }))}
              className="input-field w-32"
            >
              {PORT_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              value={swapState.amountOut}
              readOnly
              placeholder="0.0"
              className="input-field flex-1 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Slippage */}
        <div>
          <label className="text-sm font-medium mb-2 block">Slippage Tolerance</label>
          <div className="flex space-x-2">
            {['0.1', '0.5', '1.0'].map(value => (
              <button
                key={value}
                onClick={() => setSwapState(prev => ({ ...prev, slippage: value }))}
                className={`px-3 py-1 rounded text-sm ${
                  swapState.slippage === value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {value}%
              </button>
            ))}
            <input
              type="number"
              value={swapState.slippage}
              onChange={(e) => setSwapState(prev => ({ ...prev, slippage: e.target.value }))}
              className="input-field w-20 text-sm"
              step="0.1"
              min="0.1"
              max="50"
            />
          </div>
        </div>

        {/* Gas estimate */}
        {swapState.gasEstimate && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Estimated gas: {swapState.gasEstimate}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Swap button */}
        <button
          onClick={handleSwap}
          disabled={loading || !swapState.amountIn || !swapState.amountOut}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Swapping...' : 'Swap Tokens'}
        </button>

        {/* Estimate gas button */}
        <button
          onClick={estimateGas}
          disabled={!swapState.amountIn || !swapState.amountOut}
          className="w-full btn-secondary text-sm disabled:opacity-50"
        >
          Estimate Gas
        </button>
      </div>
    </div>
  );
};

export default TradePage;
