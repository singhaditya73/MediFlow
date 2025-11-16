@echo off
echo ======================================
echo Installing Foundry on Windows
echo ======================================
echo.

echo Step 1: Checking for Scoop...
where scoop >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Scoop not found. Installing Scoop first...
    echo.
    echo Please run this command in PowerShell as Administrator:
    echo.
    echo Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    echo Invoke-RestMethod -Uri https://get.scoop.sh ^| Invoke-Expression
    echo.
    echo After Scoop is installed, run this script again.
    pause
    exit /b 1
)

echo Scoop found! Installing Foundry...
echo.

scoop install foundry

echo.
echo ======================================
echo Installation Complete!
echo ======================================
echo.
echo Verifying installation...
forge --version
cast --version
anvil --version

echo.
echo ======================================
echo Next Steps:
echo ======================================
echo 1. Close and reopen your terminal
echo 2. Run: npm run blockchain:build
echo 3. Run: npm run blockchain:test
echo 4. Run: npm run blockchain:node (in separate terminal)
echo 5. Run: npm run blockchain:deploy
echo.
pause
