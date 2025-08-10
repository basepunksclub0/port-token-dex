// Token Types
export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  price?: number;
  change24h?: number;
  volume?: number;
  performance?: number;
}

// Pool Types
export interface Pool {
  tokenA: string;
  tokenB: string;
  reserveA: number;
  reserveB: number;
  totalLiquidity: number;
  userLiquidity?: number;
  apy?: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  type: 'swap' | 'add-liquidity' | 'remove-liquidity';
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  hash: string;
  fromToken?: string;
  toToken?: string;
  fromAmount?: number;
  toAmount?: number;
  tokenA?: string;
  tokenB?: string;
  amountA?: number;
  amountB?: number;
  gasUsed?: number;
  gasFee?: number;
}

// Balance Types
export interface Balances {
  [tokenSymbol: string]: number;
}

// Web3 Context Types
export interface Web3ContextType {
  account: string | null;
  provider: any;
  signer: any;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

// Contract Types
export interface ContractConfig {
  address: string;
  abi: any[];
}

export interface ContractAddresses {
  oracle: string;
  dex: string;
  tokens: {
    [symbol: string]: string;
  };
}

// Oracle Data Types
export interface OracleData {
  portCode: string;
  performanceIndex: number;
  lastUpdated: number;
}

// Price Data Types
export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  timestamp: number;
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: number;
}
