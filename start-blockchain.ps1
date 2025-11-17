# MediFlow Blockchain Startup Script
# This script starts Anvil (local Ethereum blockchain) for MediFlow

Write-Host "================================" -ForegroundColor Cyan
Write-Host "   MediFlow Blockchain Setup    " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Foundry/Anvil is installed
Write-Host "Checking for Anvil installation..." -ForegroundColor Yellow
$anvilPath = Get-Command anvil -ErrorAction SilentlyContinue

if (-not $anvilPath) {
    Write-Host "❌ Anvil not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Foundry first:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://book.getfoundry.sh/getting-started/installation" -ForegroundColor White
    Write-Host "2. Run in PowerShell: " -ForegroundColor White
    Write-Host "   irm https://github.com/foundry-rs/foundry/releases/download/nightly/foundry_nightly_x86_64-pc-windows-msvc.tar.gz -OutFile foundry.tar.gz" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or use WSL/Git Bash and run:" -ForegroundColor White
    Write-Host "   curl -L https://foundry.paradigm.xyz | bash" -ForegroundColor Cyan
    Write-Host "   foundryup" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Anvil found at: $($anvilPath.Source)" -ForegroundColor Green
Write-Host ""

Write-Host "Starting Anvil blockchain..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 IMPORTANT NOTES:" -ForegroundColor Cyan
Write-Host "- Blockchain will run on: http://127.0.0.1:8545" -ForegroundColor White
Write-Host "- Chain ID: 31337" -ForegroundColor White
Write-Host "- Test accounts with 10,000 ETH each will be created" -ForegroundColor White
Write-Host "- Keep this window open while using MediFlow" -ForegroundColor White
Write-Host "- Press Ctrl+C to stop the blockchain" -ForegroundColor White
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "   Starting Anvil...           " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Start Anvil
anvil --host 127.0.0.1 --port 8545
