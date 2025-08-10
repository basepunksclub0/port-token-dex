@echo off
echo ========================================
echo Port Token DEX - Complete Component Test
echo ========================================
echo.

echo 1. Testing Frontend TypeScript Compilation...
cd frontend
echo Checking TypeScript compilation...
call pnpm tsc --noEmit
if %errorlevel% neq 0 (
    echo ERROR: Frontend TypeScript compilation failed
    pause
    exit /b 1
)
echo ✅ Frontend TypeScript compilation successful
echo.

echo 2. Testing Oracle Backend TypeScript Compilation...
cd ../oracle
echo Checking Oracle TypeScript compilation...
call pnpm tsc --noEmit
if %errorlevel% neq 0 (
    echo ERROR: Oracle TypeScript compilation failed
    pause
    exit /b 1
)
echo ✅ Oracle TypeScript compilation successful
echo.

echo 3. Testing Contract Compilation...
cd ../contracts
echo Compiling smart contracts...
call pnpm hardhat compile
if %errorlevel% neq 0 (
    echo ERROR: Contract compilation failed
    pause
    exit /b 1
)
echo ✅ Contract compilation successful
echo.

echo 4. Running Contract Tests...
echo Testing smart contracts...
call pnpm hardhat test
if %errorlevel% neq 0 (
    echo ERROR: Contract tests failed
    pause
    exit /b 1
)
echo ✅ Contract tests passed
echo.

echo 5. Testing Frontend Build...
cd ../frontend
echo Building frontend for production...
call pnpm build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend build successful
echo.

echo 6. Testing Oracle Build...
cd ../oracle
echo Building oracle service...
call pnpm build
if %errorlevel% neq 0 (
    echo ERROR: Oracle build failed
    pause
    exit /b 1
)
echo ✅ Oracle build successful
echo.

echo ========================================
echo 🎉 ALL COMPONENTS TESTED SUCCESSFULLY!
echo ========================================
echo.
echo Your Port Token DEX is ready for:
echo ✅ Local development
echo ✅ Production deployment
echo ✅ Cloud hosting
echo.
echo Live DApp: https://port-token-dex.windsurf.build
echo.
echo To start local development:
echo 1. Run 'pnpm hardhat node' in contracts/
echo 2. Run 'pnpm dev' in oracle/
echo 3. Run 'pnpm dev' in frontend/
echo.
pause
