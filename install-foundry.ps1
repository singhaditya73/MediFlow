# Installing Foundry on Windows

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Installing Foundry on Windows" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Please run PowerShell as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Check if Scoop is installed
Write-Host "Checking for Scoop..." -ForegroundColor Yellow
$scoopInstalled = Get-Command scoop -ErrorAction SilentlyContinue

if (-not $scoopInstalled) {
    Write-Host "Scoop not found. Installing Scoop..." -ForegroundColor Yellow
    Write-Host ""
    
    # Set execution policy
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    
    # Install Scoop
    Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
    
    Write-Host ""
    Write-Host "✅ Scoop installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ Scoop is already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing Foundry via Scoop..." -ForegroundColor Yellow
Write-Host ""

# Install Foundry
scoop install foundry

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Verifying Installation" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verify installation
try {
    $forgeVersion = forge --version
    Write-Host "✅ Forge: $forgeVersion" -ForegroundColor Green
    
    $castVersion = cast --version
    Write-Host "✅ Cast: $castVersion" -ForegroundColor Green
    
    $anvilVersion = anvil --version
    Write-Host "✅ Anvil: $anvilVersion" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "✅ Installation Successful!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
} catch {
    Write-Host "❌ Installation verification failed" -ForegroundColor Red
    Write-Host "Please close this terminal and open a new one" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Close this terminal" -ForegroundColor Yellow
Write-Host "2. Open a new terminal" -ForegroundColor Yellow
Write-Host "3. Run: npm run blockchain:build" -ForegroundColor Yellow
Write-Host "4. Run: npm run blockchain:test" -ForegroundColor Yellow
Write-Host "5. Run: npm run blockchain:node (in separate terminal)" -ForegroundColor Yellow
Write-Host "6. Run: npm run blockchain:deploy" -ForegroundColor Yellow
Write-Host ""

pause
