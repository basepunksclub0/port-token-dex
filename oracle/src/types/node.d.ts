// Node.js global type declarations for Oracle backend

declare global {
  var process: NodeJS.Process;
  var console: Console;
  var Buffer: BufferConstructor;
  var setInterval: (callback: (...args: any[]) => void, ms: number) => NodeJS.Timeout;
  var setTimeout: (callback: (...args: any[]) => void, ms: number) => NodeJS.Timeout;
  var clearInterval: (intervalId: NodeJS.Timeout) => void;
  var clearTimeout: (timeoutId: NodeJS.Timeout) => void;
}

// Extend NodeJS namespace if needed
declare namespace NodeJS {
  interface Process {
    env: ProcessEnv;
  }
  
  interface ProcessEnv {
    [key: string]: string | undefined;
    NODE_ENV?: 'development' | 'production' | 'test';
    PORT?: string;
    PRIVATE_KEY?: string;
    RPC_URL?: string;
    ORACLE_ADDRESS?: string;
  }
}

export {};
