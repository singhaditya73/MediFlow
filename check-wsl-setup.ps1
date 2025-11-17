# WSL and Foundry Setup Checker for MediFlow
# Run this in PowerShell to check if everything is set up correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MediFlow WSL Setup Checker           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: WSL Installation
Write-Host "🔍 Checking WSL installation..." -ForegroundColor Yellow
try {
    $wslVersion = wsl --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ WSL is installed" -ForegroundColor Green
        Write-Host "   $($wslVersion | Select-String 'WSL version' -Raw)" -ForegroundColor Gray
    } else {
        throw "WSL not found"
    }
} catch {
    Write-Host "❌ WSL is NOT installed" -ForegroundColor Red
    Write-Host "   Install with: wsl --install (run PowerShell as Admin)" -ForegroundColor Yellow
    $allGood = $false
}
Write-Host ""

# Check 2: Anvil in WSL
Write-Host "🔍 Checking Anvil installation in WSL..." -ForegroundColor Yellow
try {
    $anvilCheck = wsl bash -c "which anvil" 2>&1
    if ($anvilCheck -match "/anvil" -or $anvilCheck -match "anvil") {
        Write-Host "✅ Anvil is installed in WSL" -ForegroundColor Green
        $anvilVersion = wsl bash -c "anvil --version" 2>&1
        Write-Host "   $anvilVersion" -ForegroundColor Gray
    } else {
        throw "Anvil not found"
    }
} catch {
    Write-Host "❌ Anvil is NOT installed in WSL" -ForegroundColor Red
    Write-Host "   Install Foundry in WSL:" -ForegroundColor Yellow
    Write-Host "   1. wsl" -ForegroundColor White
    Write-Host "   2. curl -L https://foundry.paradigm.xyz | bash" -ForegroundColor White
    Write-Host "   3. source ~/.bashrc" -ForegroundColor White
    Write-Host "   4. foundryup" -ForegroundColor White
    $allGood = $false
}
Write-Host ""

# Check 3: Forge in WSL
Write-Host "🔍 Checking Forge installation in WSL..." -ForegroundColor Yellow
try {
    $forgeCheck = wsl bash -c "which forge" 2>&1
    if ($forgeCheck -match "/forge" -or $forgeCheck -match "forge") {
        Write-Host "✅ Forge is installed in WSL" -ForegroundColor Green
        $forgeVersion = wsl bash -c "forge --version" 2>&1
        Write-Host "   $forgeVersion" -ForegroundColor Gray
    } else {
        throw "Forge not found"
    }
} catch {
    Write-Host "⚠️  Forge is NOT installed in WSL" -ForegroundColor Yellow
    Write-Host "   Install with: foundryup (in WSL)" -ForegroundColor White
}
Write-Host ""

# Check 4: Node.js
Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js is installed" -ForegroundColor Green
        Write-Host "   Version: $nodeVersion" -ForegroundColor Gray
    } else {
        throw "Node not found"
    }
} catch {
    Write-Host "❌ Node.js is NOT installed" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}
Write-Host ""

# Check 5: NPM dependencies
Write-Host "🔍 Checking NPM dependencies..." -ForegroundColor Yellow
if (Test-Path ".\node_modules") {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules not found" -ForegroundColor Yellow
    Write-Host "   Run: npm install" -ForegroundColor White
}
Write-Host ""

# Check 6: Test Anvil connection
Write-Host "🔍 Testing if Anvil can be started..." -ForegroundColor Yellow
try {
    Write-Host "   Starting Anvil (will stop in 3 seconds)..." -ForegroundColor Gray
    $anvilJob = Start-Job -ScriptBlock { wsl bash -c "anvil --host 0.0.0.0 --port 8545" }
    Start-Sleep -Seconds 3
    
    # Try to connect
    try {
        $body = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:8545" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 2
        Write-Host "✅ Anvil can start and accept connections!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not connect to Anvil" -ForegroundColor Yellow
        Write-Host "   This might be a firewall issue" -ForegroundColor White
    }
    
    Stop-Job $anvilJob
    Remove-Job $anvilJob
} catch {
    Write-Host "⚠️  Could not test Anvil" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  ✅ All essential components ready!    " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. npm run blockchain:node  (Terminal 1)" -ForegroundColor White
    Write-Host "2. npm run dev              (Terminal 2)" -ForegroundColor White
    Write-Host "3. Visit http://localhost:3000" -ForegroundColor White
} else {
    Write-Host "  ⚠️  Some setup required               " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please fix the issues marked with ❌ above" -ForegroundColor Yellow
    Write-Host "Check START_WSL.md for detailed instructions" -ForegroundColor White
}
Write-Host ""
