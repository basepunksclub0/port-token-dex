@echo off
echo ========================================
echo Port Token DEX - GitHub Setup Script
echo ========================================
echo.

echo This script will help you prepare your Port Token DEX for GitHub deployment.
echo.

echo 1. Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo ERROR: Git initialization failed. Make sure Git is installed.
    pause
    exit /b 1
)
echo ✅ Git repository initialized
echo.

echo 2. Adding all files to Git...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files to Git
    pause
    exit /b 1
)
echo ✅ Files added to Git
echo.

echo 3. Creating initial commit...
git commit -m "Initial commit: Port Token DEX - Complete DApp with smart contracts, frontend, and oracle"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create commit
    pause
    exit /b 1
)
echo ✅ Initial commit created
echo.

echo 4. Setting main branch...
git branch -M main
echo ✅ Main branch set
echo.

echo ========================================
echo 🎉 GitHub Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create a new repository on GitHub.com named 'port-token-dex'
echo 2. Run this command to connect to your GitHub repo:
echo    git remote add origin https://github.com/YOURUSERNAME/port-token-dex.git
echo 3. Push to GitHub:
echo    git push -u origin main
echo.
echo For GitHub Pages deployment:
echo 1. Go to repository Settings → Pages
echo 2. Source: Deploy from a branch
echo 3. Branch: main
echo 4. Folder: /dapp/public
echo 5. Save
echo.
echo Your DApp will be live at:
echo https://YOURUSERNAME.github.io/port-token-dex
echo.
echo For GitHub Codespaces:
echo 1. Go to your repository
echo 2. Click "Code" → "Codespaces" → "Create codespace on main"
echo 3. Full development environment ready!
echo.
pause
