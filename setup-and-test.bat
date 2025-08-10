@echo off
echo Port Token DEX MVP - Setup and Test Script
echo ==========================================
echo.

echo 1. Installing dependencies in all directories...
echo.

echo Installing contracts dependencies...
cd contracts
pnpm install
echo.

echo Installing oracle dependencies...
cd ../oracle
pnpm install
echo.

echo Installing frontend dependencies...
cd ../frontend
pnpm install
echo.

echo 2. Starting local blockchain network...
echo You'll need to run 'pnpm hardhat node' in a separate terminal in the contracts directory
echo.

echo 3. Deploying contracts to local network...
cd ../contracts
pnpm hardhat run scripts/test-local.ts --network localhost
echo.

echo 4. Setup complete!
echo Next steps:
echo - Update oracle/.env with the deployed PortOracle address
echo - Run 'pnpm dev' in the oracle directory to start the oracle service
echo - Run 'pnpm dev' in the frontend directory to start the frontend
echo - Connect MetaMask to the local network (http://127.0.0.1:8545)
echo - Import the deployed token addresses into MetaMask
echo.

pause
