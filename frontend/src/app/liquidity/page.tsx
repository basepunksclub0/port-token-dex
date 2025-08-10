'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { PORT_TOKENS, CONTRACT_ADDRESSES, ABIS } from '@/config/contracts';
import { ethers } from 'ethers';

interface LiquidityState {
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  userLiquidity: string;
  totalLiquidity: string;
  reserveA: string;
  reserveB: string;
}

const LiquidityPage: React.FC = () => {
  const { provider, signer, account, isConnected } = useWeb3();
  const [liquidityState, setLiquidityState] = useState<LiquidityState>({
    tokenA: PORT_TOKENS[0]?.symbol || '',
    tokenB: PORT_TOKENS[1]?.symbol || '',
    amountA: '',
    amountB: '',
    userLiquidity: '0',
    totalLiquidity: '0',
    reserveA: '0',
    reserveB: '0',
  });
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isConnected && provider && account) {
      loadBalances();
      loadPoolData();
    }
  }, [isConnected, provider, account, liquidityState.tokenA, liquidityState.tokenB]);

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

  const loadPoolData = async () => {
    try {
      const tokenAData = PORT_TOKENS.find(t => t.symbol === liquidityState.tokenA);
      const tokenBData = PORT_TOKENS.find(t => t.symbol === liquidityState.tokenB);
      
      if (!tokenAData?.address || !tokenBData?.address || !provider) return;

      const dexContract = new ethers.Contract(CONTRACT_ADDRESSES.dex, ABIS.PortDEX, provider);
      
      const [reserveA, reserveB] = await dexContract.getReserves(tokenAData.address, tokenBData.address);
      const userLiquidity = await dexContract.getUserLiquidity(tokenAData.address, tokenBData.address, account);

      setLiquidityState(prev => ({
        ...prev,
        reserveA: ethers.formatEther(reserveA),
        reserveB: ethers.formatEther(reserveB),
        userLiquidity: ethers.formatEther(userLiquidity),
      }));
    } catch (err) {
      console.error('Error loading pool data:', err);
    }
  };

  const handleAddLiquidity = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!signer || !liquidityState.amountA || !liquidityState.amountB) {
        throw new Error('Missing required data');
      }

      const tokenAData = PORT_TOKENS.find(t => t.symbol === liquidityState.tokenA);
      const tokenBData = PORT_TOKENS.find(t => t.symbol === liquidityState.tokenB);
      
      if (!tokenAData?.address || !tokenBData?.address) {
        throw new Error('Token addresses not found');
      }

      const amountAWei = ethers.parseEther(liquidityState.amountA);
      const amountBWei = ethers.parseEther(liquidityState.amountB);

      // Approve both tokens
      const tokenAContract = new ethers.Contract(tokenAData.address, ABIS.ERC20, signer);
      const tokenBContract = new ethers.Contract(tokenBData.address, ABIS.ERC20, signer);

      const approveATx = await tokenAContract.approve(CONTRACT_ADDRESSES.dex, amountAWei);
      await approveATx.wait();

      const approveBTx = await tokenBContract.approve(CONTRACT_ADDRESSES.dex, amountBWei);
      await approveBTx.wait();

      // Add liquidity
      const dexContract = new ethers.Contract(CONTRACT_ADDRESSES.dex, ABIS.PortDEX, signer);
      const liquidityTx = await dexContract.addLiquidity(
        tokenAData.address,
        tokenBData.address,
        amountAWei,
        amountBWei
      );

      await liquidityTx.wait();
      
      // Refresh data
      await loadBalances();
      await loadPoolData();
      
      // Reset form
      setLiquidityState(prev => ({ ...prev, amountA: '', amountB: '' }));
      
    } catch (err: any) {
      console.error('Add liquidity failed:', err);
      setError(err.message || 'Failed to add liquidity');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!signer || !liquidityState.userLiquidity || parseFloat(liquidityState.userLiquidity) <= 0) {
        throw new Error('No liquidity to remove');
      }

      const tokenAData = PORT_TOKENS.find(t => t.symbol === liquidityState.tokenA);
      const tokenBData = PORT_TOKENS.find(t => t.symbol === liquidityState.tokenB);
      
      if (!tokenAData?.address || !tokenBData?.address) {
        throw new Error('Token addresses not found');
      }

      const dexContract = new ethers.Contract(CONTRACT_ADDRESSES.dex, ABIS.PortDEX, signer);
      const liquidityWei = ethers.parseEther(liquidityState.userLiquidity);

      const removeTx = await dexContract.removeLiquidity(
        tokenAData.address,
        tokenBData.address,
        liquidityWei
      );

      await removeTx.wait();
      
      // Refresh data
      await loadBalances();
      await loadPoolData();
      
    } catch (err: any) {
      console.error('Remove liquidity failed:', err);
      setError(err.message || 'Failed to remove liquidity');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Liquidity Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to manage liquidity
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Liquidity</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add or remove liquidity from trading pools
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'add'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Add Liquidity
        </button>
        <button
          onClick={() => setActiveTab('remove')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'remove'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Remove Liquidity
        </button>
      </div>

      <div className="card space-y-4">
        {/* Token pair selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Token A</label>
            <select
              value={liquidityState.tokenA}
              onChange={(e) => setLiquidityState(prev => ({ ...prev, tokenA: e.target.value }))}
              className="input-field"
            >
              {PORT_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Balance: {balances[liquidityState.tokenA] || '0'}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Token B</label>
            <select
              value={liquidityState.tokenB}
              onChange={(e) => setLiquidityState(prev => ({ ...prev, tokenB: e.target.value }))}
              className="input-field"
            >
              {PORT_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Balance: {balances[liquidityState.tokenB] || '0'}
            </div>
          </div>
        </div>

        {/* Pool info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-2">Pool Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Reserve {liquidityState.tokenA}</div>
              <div className="font-mono">{parseFloat(liquidityState.reserveA).toFixed(4)}</div>
            </div>
            <div>
              <div className="text-gray-500">Reserve {liquidityState.tokenB}</div>
              <div className="font-mono">{parseFloat(liquidityState.reserveB).toFixed(4)}</div>
            </div>
            <div>
              <div className="text-gray-500">Your Liquidity</div>
              <div className="font-mono">{parseFloat(liquidityState.userLiquidity).toFixed(4)}</div>
            </div>
            <div>
              <div className="text-gray-500">Pool Share</div>
              <div className="font-mono">
                {liquidityState.totalLiquidity !== '0' 
                  ? ((parseFloat(liquidityState.userLiquidity) / parseFloat(liquidityState.totalLiquidity)) * 100).toFixed(2)
                  : '0.00'
                }%
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'add' ? (
          <>
            {/* Add liquidity form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Amount {liquidityState.tokenA}
                </label>
                <input
                  type="number"
                  value={liquidityState.amountA}
                  onChange={(e) => setLiquidityState(prev => ({ ...prev, amountA: e.target.value }))}
                  placeholder="0.0"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Amount {liquidityState.tokenB}
                </label>
                <input
                  type="number"
                  value={liquidityState.amountB}
                  onChange={(e) => setLiquidityState(prev => ({ ...prev, amountB: e.target.value }))}
                  placeholder="0.0"
                  className="input-field"
                />
              </div>
            </div>

            <button
              onClick={handleAddLiquidity}
              disabled={loading || !liquidityState.amountA || !liquidityState.amountB}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Liquidity...' : 'Add Liquidity'}
            </button>
          </>
        ) : (
          <>
            {/* Remove liquidity form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Liquidity to Remove
                </label>
                <input
                  type="number"
                  value={liquidityState.userLiquidity}
                  onChange={(e) => setLiquidityState(prev => ({ ...prev, userLiquidity: e.target.value }))}
                  placeholder="0.0"
                  max={liquidityState.userLiquidity}
                  className="input-field"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Max: {parseFloat(liquidityState.userLiquidity).toFixed(4)}
                </div>
              </div>

              <div className="flex space-x-2">
                {['25', '50', '75', '100'].map(percentage => (
                  <button
                    key={percentage}
                    onClick={() => {
                      const amount = (parseFloat(liquidityState.userLiquidity) * parseInt(percentage) / 100).toString();
                      setLiquidityState(prev => ({ ...prev, userLiquidity: amount }));
                    }}
                    className="flex-1 py-1 px-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    {percentage}%
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRemoveLiquidity}
              disabled={loading || !liquidityState.userLiquidity || parseFloat(liquidityState.userLiquidity) <= 0}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Removing Liquidity...' : 'Remove Liquidity'}
            </button>
          </>
        )}

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Pool creation */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Create New Pool</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Create a new trading pool for any token pair
        </p>
        <button
          onClick={async () => {
            try {
              setLoading(true);
              const tokenAData = PORT_TOKENS.find(t => t.symbol === liquidityState.tokenA);
              const tokenBData = PORT_TOKENS.find(t => t.symbol === liquidityState.tokenB);
              
              if (!tokenAData?.address || !tokenBData?.address || !signer) return;

              const dexContract = new ethers.Contract(CONTRACT_ADDRESSES.dex, ABIS.PortDEX, signer);
              const createTx = await dexContract.createPool(tokenAData.address, tokenBData.address);
              await createTx.wait();
              
              await loadPoolData();
            } catch (err: any) {
              setError(err.message || 'Failed to create pool');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full btn-secondary disabled:opacity-50"
        >
          {loading ? 'Creating Pool...' : `Create ${liquidityState.tokenA}/${liquidityState.tokenB} Pool`}
        </button>
      </div>
    </div>
  );
};

export default LiquidityPage;
