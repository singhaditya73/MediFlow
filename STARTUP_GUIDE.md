# MediFlow Complete Startup Guide

## Quick Start (3 Steps)

### Step 1: Install MetaMask
1. Go to [metamask.io/download](https://metamask.io/download/)
2. Install the browser extension
3. Create a wallet (save your recovery phrase!)

### Step 2: Start the Blockchain (in WSL)

**IMPORTANT:** Anvil must run in WSL (Windows Subsystem for Linux)

**Option A: Using NPM (Recommended)**
Open PowerShell and run:
```powershell
cd "c:\Users\ADITYA SINGH\Desktop\website"
npm run blockchain:node
```

**Option B: Direct WSL Command**
```powershell
wsl bash -c 'anvil --host 0.0.0.0 --port 8545'
```

**Option C: WSL Terminal**
1. Open WSL: Type `wsl` in PowerShell
2. Navigate: `cd /mnt/c/Users/ADITYA\ SINGH/Desktop/website`
3. Run script: `./start-anvil-wsl.sh`

**Keep this terminal open!** You should see:
```
Available Accounts:
==================
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000.000000000000000000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000.000000000000000000 ETH)
...

Private Keys:
==================
(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
(1) 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```

### Step 3: Start the Website
Open a **second terminal** and run:
```powershell
cd "c:\Users\ADITYA SINGH\Desktop\website"
npm run dev
```

Visit: http://localhost:3000

## Connecting Your Wallet

1. **Click "Connect Wallet"** on the website
2. **MetaMask popup appears** - Click "Next" → "Connect"
3. **Network switch prompt** - Click "Approve" (adds Localhost network)
4. **Sign message** - Click "Sign" to authenticate

### If MetaMask doesn't popup:
- Check the MetaMask extension icon (top-right of browser)
- Click it to open MetaMask
- Make sure it's unlocked
- Try clicking "Connect Wallet" again

## Common Issues & Solutions

### ❌ "MetaMask not detected"
**Solution:** 
- Install MetaMask from metamask.io
- Refresh the page
- Make sure Phantom is NOT interfering (disable it if installed)

### ❌ "Please install MetaMask or another Ethereum wallet"
**Solution:**
- You have Phantom installed (Solana wallet)
- Install MetaMask (Ethereum wallet)
- Phantom will NOT work - MediFlow uses Ethereum, not Solana

### ❌ Connection request doesn't appear
**Solution:**
1. Click the MetaMask extension icon
2. Unlock MetaMask if locked
3. Look for pending requests in MetaMask
4. Allow popups for localhost in browser

### ❌ Network errors or transactions fail
**Solution:**
1. Make sure blockchain is running: `npm run blockchain:node`
2. Check MetaMask is on "Localhost 8545" network
3. Import a test account (see below)

### ❌ "Insufficient funds" error
**Solution:**
Import a test account with ETH:
1. Open MetaMask
2. Click account icon → "Import Account"
3. Paste this private key: 
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. This account has 10,000 test ETH

## Terminal Setup

You need **TWO terminals running** simultaneously:

### Terminal 1: Blockchain (Anvil in WSL)
```powershell
# Navigate to project
cd "c:\Users\ADITYA SINGH\Desktop\website"

# Start blockchain using WSL
npm run blockchain:node

# Or directly in WSL:
# wsl
# cd /mnt/c/Users/ADITYA\ SINGH/Desktop/website
# ./start-anvil-wsl.sh

# Keep this running! You should see test accounts listed
```

### Terminal 2: Next.js Dev Server
```powershell
# Navigate to project (new terminal)
cd "c:\Users\ADITYA SINGH\Desktop\website"

# Start dev server
npm run dev

# Visit http://localhost:3000
```

## MetaMask Configuration

### Add Localhost Network Manually (if needed)

1. Open MetaMask
2. Click network dropdown (top)
3. Click "Add Network" → "Add network manually"
4. Enter:
   ```
   Network Name: Localhost 8545
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   ```
5. Click "Save"

### Import Test Account (for transactions)

1. Open MetaMask
2. Click account icon → "Import Account"
3. Select "Private Key"
4. Paste: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
5. Click "Import"

This account starts with 10,000 ETH (fake test money).

## Understanding the Error

**Phantom vs MetaMask:**

❌ **Phantom Wallet:**
- Solana blockchain wallet
- Does NOT support Ethereum
- Will NOT work with MediFlow

✅ **MetaMask:**
- Ethereum blockchain wallet
- Supports smart contracts
- Required for MediFlow

**Why you need MetaMask:**
MediFlow uses Ethereum smart contracts for:
- Access control (who can view medical records)
- Audit logging (tracking all access)
- IPFS hash storage (decentralized files)

None of this works with Phantom because it's a completely different blockchain.

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ 1. Install MetaMask Extension                       │
│    → metamask.io/download                           │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 2. Start Blockchain (Terminal 1)                    │
│    → npm run blockchain:node                        │
│    → Keep running in background                     │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 3. Start Dev Server (Terminal 2)                    │
│    → npm run dev                                     │
│    → Visit http://localhost:3000                    │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 4. Click "Connect Wallet"                           │
│    → MetaMask popup appears                         │
│    → Click "Next" → "Connect"                       │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 5. Approve Network Switch                           │
│    → Adds "Localhost 8545" network                  │
│    → Click "Approve" or "Switch Network"            │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 6. Sign Authentication Message                      │
│    → Click "Sign" in MetaMask                       │
│    → You're now connected! ✅                       │
└─────────────────────────────────────────────────────┘
```

## Still Having Issues?

1. **Check both terminals are running**
   - Terminal 1: Shows blockchain accounts
   - Terminal 2: Shows "Ready in [time]"

2. **Check MetaMask is on correct network**
   - Network should say "Localhost 8545"
   - Not "Ethereum Mainnet" or any other network

3. **Check browser console for errors**
   - Press F12 → Console tab
   - Look for red error messages
   - Share them if you need help

4. **Restart everything**
   ```powershell
   # Stop both terminals (Ctrl+C)
   # Then restart:
   
   # Terminal 1
   npm run blockchain:node
   
   # Terminal 2  
   npm run dev
   ```

5. **Reset MetaMask**
   - Settings → Advanced → Reset Account
   - This clears transaction history
   - Then try connecting again

## Need Help?

If you're still stuck:
1. Make sure Phantom is NOT running (close/disable it)
2. Make sure MetaMask IS installed and unlocked
3. Make sure BOTH terminals are running
4. Try in an incognito/private browser window
5. Check the WALLET_SETUP.md file for more details
