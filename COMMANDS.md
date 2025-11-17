# Quick Reference: MediFlow Commands

## Essential Commands

### 1. Start Everything
```powershell
# Terminal 1: Start blockchain
npm run blockchain:node

# Terminal 2: Start website (new terminal)
npm run dev
```

### 2. Stop Everything
Press `Ctrl + C` in each terminal

## Blockchain Commands (WSL)

**Note:** All blockchain commands run in WSL (Windows Subsystem for Linux)

```powershell
# Start local Ethereum blockchain (Anvil in WSL)
npm run blockchain:node

# Start using bash script (alternative)
npm run blockchain:node:script

# Build smart contracts (in WSL)
npm run blockchain:build

# Test smart contracts (in WSL)
npm run blockchain:test

# Deploy contracts to local blockchain (in WSL)
npm run blockchain:deploy

# Check contract coverage (in WSL)
npm run blockchain:coverage
```

### Direct WSL Commands

```bash
# Open WSL terminal
wsl

# Navigate to project
cd /mnt/c/Users/ADITYA\ SINGH/Desktop/website

# Start Anvil with correct host
anvil --host 0.0.0.0 --port 8545

# Or use the script
./start-anvil-wsl.sh
```

## Development Commands

```powershell
# Start Next.js dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## MetaMask Configuration

### Network Settings
```
Network Name: Localhost 8545
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

### Import Test Account
Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## Troubleshooting Commands

### Check if Anvil is running (WSL)
```powershell
# Check WSL processes
wsl ps aux | grep anvil

# Test connection from Windows
curl http://127.0.0.1:8545 -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}'
```

### Check if dev server is running
```powershell
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -eq "node"}
```

### Reset everything
```powershell
# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill Anvil
Get-Process anvil -ErrorAction SilentlyContinue | Stop-Process -Force

# Restart
npm run blockchain:node  # Terminal 1
npm run dev             # Terminal 2
```

## Port Usage

- **3000** - Next.js dev server (http://localhost:3000)
- **8545** - Anvil blockchain (http://127.0.0.1:8545)

## File Locations

```
MediFlow/
├── app/                    # Next.js pages
│   ├── signup/            # Wallet connection
│   ├── upload/            # File upload
│   └── page.tsx           # Homepage
├── lib/
│   ├── wallet.ts          # Wallet utilities
│   └── ipfs.ts           # IPFS functions
├── contracts/             # Smart contracts
├── STARTUP_GUIDE.md      # Detailed setup guide
├── WALLET_SETUP.md       # MetaMask guide
└── start-blockchain.ps1  # Blockchain starter
```

## Common Workflows

### First Time Setup
1. Install MetaMask from metamask.io
2. `npm install`
3. `npm run blockchain:node` (Terminal 1)
4. `npm run dev` (Terminal 2)
5. Visit http://localhost:3000
6. Click "Connect Wallet"

### Daily Development
1. `npm run blockchain:node` (Terminal 1)
2. `npm run dev` (Terminal 2)
3. Connect MetaMask
4. Start coding!

### Before Deploying
1. `npm run blockchain:test` - Run tests
2. `npm run lint` - Check code quality
3. `npm run build` - Build production
4. Deploy to hosting provider

## Environment Variables

Create `.env.local` if needed:
```env
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
PINATA_JWT=your_pinata_jwt_here
```

## Need Help?

1. Check STARTUP_GUIDE.md - Complete walkthrough
2. Check WALLET_SETUP.md - MetaMask instructions
3. Browser console (F12) - Check for errors
4. Terminal output - Check for error messages
