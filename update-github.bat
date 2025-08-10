@echo off
echo Adding TradingView charts to GitHub repository...

REM Add all changes to git
git add .

REM Commit the changes
git commit -m "Add TradingView professional charts to analytics dashboard"

REM Push to GitHub
git push origin main

echo.
echo TradingView charts have been pushed to GitHub!
echo Your changes will be live at: https://basepunksclub0.github.io/port-token-dex/
echo.
echo GitHub Actions will automatically deploy your changes.
echo Check the Actions tab in your GitHub repository to monitor progress.

pause
