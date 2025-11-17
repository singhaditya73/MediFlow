# 🚀 MediFlow - Quick Start with WSL

## ⚡ TL;DR - Just Want to Run It?

```powershell
# Terminal 1 - Start blockchain (WSL)
npm run blockchain:node

# Terminal 2 - Start website
npm run dev

# Visit: http://localhost:3000
```

## 📋 Prerequisites Check

Run this first to check your setup:
```powershell
.\check-wsl-setup.ps1
```

## 🛠️ First Time Setup

### 1️⃣ Install WSL (if not installed)
```powershell
# Run PowerShell as Administrator
wsl --install

# Restart computer
```

### 2️⃣ Install Foundry in WSL
```bash
# Open WSL terminal
wsl

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Reload shell
source ~/.bashrc

# Install Foundry tools
foundryup

# Verify
anvil --version
```

### 3️⃣ Install MetaMask
- Visit: https://metamask.io/download/
- Install browser extension
- Create wallet

### 4️⃣ Install Node Dependencies
```powershell
# In PowerShell
npm install
```

## 🎯 Running MediFlow

### Terminal 1: Blockchain
```powershell
cd "c:\Users\ADITYA SINGH\Desktop\website"
npm run blockchain:node
```

**Keep this running!** You'll see test accounts like:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Terminal 2: Website
```powershell
cd "c:\Users\ADITYA SINGH\Desktop\website"
npm run dev
```

Visit: **http://localhost:3000**

## 🦊 Connect MetaMask

1. Click "Connect Wallet" on the website
2. MetaMask popup → Click "Connect"
3. Approve network switch (adds Localhost 8545)
4. Sign the message
5. Done! ✅

### MetaMask Network Config
```
Network Name: Localhost 8545
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

### Import Test Account (Optional)
For testing transactions:
1. MetaMask → Import Account
2. Paste: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. This gives you 10,000 test ETH

## 🚨 Common Issues

### ❌ "npm run blockchain:node" fails
**Solution:** Make sure WSL and Foundry are installed
```powershell
# Check WSL
wsl --version

# Check Anvil in WSL
wsl bash -c "anvil --version"
```

### ❌ "MetaMask not detected"
**Solution:** Install MetaMask from https://metamask.io/download/

### ❌ Connection errors
**Solution:** Make sure Anvil is running with `--host 0.0.0.0`
```bash
# In WSL
anvil --host 0.0.0.0 --port 8545
```

### ❌ "Port already in use"
**Solution:** Kill existing Anvil process
```bash
# In WSL
pkill anvil
```

## 📚 Documentation

- **START_WSL.md** - WSL + Anvil setup guide
- **STARTUP_GUIDE.md** - Complete walkthrough
- **WALLET_SETUP.md** - MetaMask configuration
- **COMMANDS.md** - All available commands
- **WALLET_FIX_SUMMARY.md** - Why MetaMask (not Phantom)

## 🔍 Verify Everything Works

### 1. Check Anvil is Running
```powershell
wsl ps aux | grep anvil
```

### 2. Test Connection
```powershell
curl http://127.0.0.1:8545 -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### 3. Check Dev Server
```
Browser: http://localhost:3000
Should see: MediFlow homepage
```

## 💡 Tips

- **Keep both terminals open** while developing
- **Anvil must run in WSL**, not Windows
- **Next.js runs in PowerShell**, not WSL
- **Use `--host 0.0.0.0`** when starting Anvil
- **Test accounts reset** when you restart Anvil

## 🆘 Need Help?

1. Run: `.\check-wsl-setup.ps1`
2. Check browser console (F12 → Console)
3. Read START_WSL.md for detailed troubleshooting
4. Make sure both terminals are running
5. Verify MetaMask is on "Localhost 8545" network

---

**Ready to go? Run these two commands in separate terminals:**

```powershell
Terminal 1: npm run blockchain:node
Terminal 2: npm run dev
```

Then visit **http://localhost:3000** and click **"Connect Wallet"**! 🚀
