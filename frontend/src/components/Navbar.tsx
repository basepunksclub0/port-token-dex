'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import { SEPOLIA_CHAIN_ID } from '@/config/contracts';

const Navbar: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet, chainId, switchNetwork } = useWeb3();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      if (chainId !== SEPOLIA_CHAIN_ID) {
        await switchNetwork(SEPOLIA_CHAIN_ID);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/trade', label: 'Trade' },
    { href: '/liquidity', label: 'Liquidity' },
    { href: '/analytics', label: 'Analytics' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl">🚢</div>
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              Port DEX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* Network indicator */}
            {isConnected && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                chainId === SEPOLIA_CHAIN_ID 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {chainId === SEPOLIA_CHAIN_ID ? 'Sepolia' : 'Wrong Network'}
              </div>
            )}

            {/* Wallet connection */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium">
                  {formatAddress(account!)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleWalletConnect}
                className="btn-primary"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-gray-600 dark:bg-gray-300"></div>
                <div className="w-full h-0.5 bg-gray-600 dark:bg-gray-300"></div>
                <div className="w-full h-0.5 bg-gray-600 dark:bg-gray-300"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
