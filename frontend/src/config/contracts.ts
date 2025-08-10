import { ethers } from 'ethers';
import { ContractAddresses } from '@/types';

// Contract ABIs (simplified for frontend use)
export const ORACLE_ABI = [
  "function getPortPerformance(string memory portCode) external view returns (uint256)",
  "function updatePortPerformance(string memory portCode, uint256 performanceIndex) external",
  "function owner() external view returns (address)",
  "event PerformanceUpdated(string indexed portCode, uint256 performanceIndex, uint256 timestamp)"
];

export const TOKEN_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const DEX_ABI = [
  "function createPool(address tokenA, address tokenB) external returns (address)",
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 minAmountA, uint256 minAmountB) external returns (uint256, uint256, uint256)",
  "function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 minAmountA, uint256 minAmountB) external returns (uint256, uint256)",
  "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external returns (uint256)",
  "function getPool(address tokenA, address tokenB) external view returns (address)",
  "function getReserves(address tokenA, address tokenB) external view returns (uint256, uint256)",
  "function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) external view returns (uint256)",
  "function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) external pure returns (uint256)",
  "event PoolCreated(address indexed tokenA, address indexed tokenB, address pool)",
  "event LiquidityAdded(address indexed user, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint256 liquidity)",
  "event LiquidityRemoved(address indexed user, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint256 liquidity)",
  "event Swap(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)"
];

// Network configurations
export const NETWORKS = {
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: null,
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://etherscan.io',
  },
};

// Default contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES: ContractAddresses = {
  oracle: process.env.NEXT_PUBLIC_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000',
  dex: process.env.NEXT_PUBLIC_DEX_ADDRESS || '0x0000000000000000000000000000000000000000',
  tokens: {
    pSINGAPORE: process.env.NEXT_PUBLIC_PSINGAPORE_ADDRESS || '0x0000000000000000000000000000000000000000',
    pDUBAI: process.env.NEXT_PUBLIC_PDUBAI_ADDRESS || '0x0000000000000000000000000000000000000000',
    pROTTERDAM: process.env.NEXT_PUBLIC_PROTTERDAM_ADDRESS || '0x0000000000000000000000000000000000000000',
    pSHANGHAI: process.env.NEXT_PUBLIC_PSHANGHAI_ADDRESS || '0x0000000000000000000000000000000000000000',
    pLONDON: process.env.NEXT_PUBLIC_PLONDON_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
};

// Token metadata
export const TOKENS = {
  pSINGAPORE: {
    symbol: 'pSINGAPORE',
    name: 'Port Singapore Token',
    decimals: 18,
    description: 'Token representing Singapore port performance',
  },
  pDUBAI: {
    symbol: 'pDUBAI',
    name: 'Port Dubai Token',
    decimals: 18,
    description: 'Token representing Dubai port performance',
  },
  pROTTERDAM: {
    symbol: 'pROTTERDAM',
    name: 'Port Rotterdam Token',
    decimals: 18,
    description: 'Token representing Rotterdam port performance',
  },
  pSHANGHAI: {
    symbol: 'pSHANGHAI',
    name: 'Port Shanghai Token',
    decimals: 18,
    description: 'Token representing Shanghai port performance',
  },
  pLONDON: {
    symbol: 'pLONDON',
    name: 'Port London Token',
    decimals: 18,
    description: 'Token representing London port performance',
  },
};

// Default network
export const DEFAULT_NETWORK = NETWORKS.localhost;

// Chain IDs for easy reference
export const SEPOLIA_CHAIN_ID = 11155111;
export const LOCALHOST_CHAIN_ID = 31337;
export const MAINNET_CHAIN_ID = 1;

// Export PORT_TOKENS as array for component compatibility
export const PORT_TOKENS = [
  {
    symbol: 'pSINGAPORE',
    name: 'Port Singapore Token',
    portName: 'Singapore',
    decimals: 18,
    description: 'Token representing Singapore port performance',
    address: CONTRACT_ADDRESSES.tokens.pSINGAPORE,
    icon: '🇸🇬',
  },
  {
    symbol: 'pDUBAI',
    name: 'Port Dubai Token',
    portName: 'Dubai',
    decimals: 18,
    description: 'Token representing Dubai port performance',
    address: CONTRACT_ADDRESSES.tokens.pDUBAI,
    icon: '🇦🇪',
  },
  {
    symbol: 'pROTTERDAM',
    name: 'Port Rotterdam Token',
    portName: 'Rotterdam',
    decimals: 18,
    description: 'Token representing Rotterdam port performance',
    address: CONTRACT_ADDRESSES.tokens.pROTTERDAM,
    icon: '🇳🇱',
  },
  {
    symbol: 'pSHANGHAI',
    name: 'Port Shanghai Token',
    portName: 'Shanghai',
    decimals: 18,
    description: 'Token representing Shanghai port performance',
    address: CONTRACT_ADDRESSES.tokens.pSHANGHAI,
    icon: '🇨🇳',
  },
  {
    symbol: 'pLONDON',
    name: 'Port London Token',
    portName: 'London',
    decimals: 18,
    description: 'Token representing London port performance',
    address: CONTRACT_ADDRESSES.tokens.pLONDON,
    icon: '🇬🇧',
  },
];

// Export ABIS object for component compatibility
export const ABIS = {
  oracle: ORACLE_ABI,
  token: TOKEN_ABI,
  dex: DEX_ABI,
  PortOracle: ORACLE_ABI,
  ERC20: TOKEN_ABI,
  PortDEX: DEX_ABI,
};

// Gas settings
export const GAS_SETTINGS = {
  gasLimit: 300000,
  maxFeePerGas: ethers.parseUnits('20', 'gwei'),
  maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
};

// Utility functions
export function getNetworkById(chainId: number) {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
}

export function isValidNetwork(chainId: number): boolean {
  return Object.values(NETWORKS).some(network => network.chainId === chainId);
}

export function getTokenAddress(symbol: string): string {
  return CONTRACT_ADDRESSES.tokens[symbol] || '0x0000000000000000000000000000000000000000';
}

export function getTokenMetadata(symbol: string) {
  return TOKENS[symbol as keyof typeof TOKENS];
}
