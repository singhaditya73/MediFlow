# MetaMask Wallet Setup Guide

## Important: Phantom vs MetaMask

⚠️ **MediFlow uses Ethereum blockchain, NOT Solana**

- ❌ **Phantom Wallet** - Solana wallet (will NOT work with MediFlow)
- ✅ **MetaMask** - Ethereum wallet (required for MediFlow)

## Step-by-Step Setup

### 1. Install MetaMask

1. Visit [metamask.io](https://metamask.io/download/)
2. Click "Download" for your browser (Chrome, Firefox, Brave, Edge)
3. Install the browser extension
4. Create a new wallet or import existing one
5. **Save your Secret Recovery Phrase securely!**

### 2. Configure Localhost Network

MediFlow runs on a local Ethereum network (Anvil/Foundry). You need to add this network to MetaMask:

#### Option A: Automatic (Recommended)
When you click "Connect Wallet" on MediFlow, it will automatically:
- Request to add the Localhost network
- Switch to the correct network

Just approve the MetaMask prompts!

#### Option B: Manual Setup
If automatic setup fails, add manually:

1. Open MetaMask
2. Click the network dropdown (top-left)
3. Click "Add Network" → "Add network manually"
4. Enter these details:
   ```
   Network Name: Localhost 8545
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   ```
5. Click "Save"

### 3. Start Your Local Blockchain

Before connecting your wallet, ensure your local blockchain is running:

```bash
# In your terminal, navigate to your project
cd c:\Users\ADITYA SINGH\Desktop\website

# Start Anvil (Foundry's local blockchain)
npx anvil

# Or if using Hardhat
npx hardhat node
```

You should see output like:
```
Available Accounts:
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
...

Private Keys:
(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
(1) 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```

### 4. Import Test Account to MetaMask

For development, import one of Anvil's test accounts:

1. Open MetaMask
2. Click the account icon → "Import Account"
3. Paste one of the private keys from Anvil output
   - Example: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. Click "Import"

**Note:** These are TEST accounts with fake ETH. Never use these keys on mainnet!

### 5. Connect to MediFlow

1. Make sure your local blockchain (Anvil) is running
2. Navigate to http://localhost:3000 (or your dev server)
3. Click "Connect Wallet"
4. MetaMask popup will appear - click "Next" → "Connect"
5. Approve network switch if prompted
6. Sign the authentication message

## Troubleshooting

### "MetaMask not detected"
- Install MetaMask browser extension from metamask.io
- Refresh the page after installation
- Make sure you're using a supported browser (Chrome, Firefox, Brave, Edge)

### "Wrong Network" or network errors
- Make sure Anvil is running: `npx anvil`
- Check if you're on "Localhost 8545" network in MetaMask
- Manually add the network using the instructions above
- Restart Anvil and refresh the page

### MetaMask popup doesn't appear
- Check if MetaMask is locked - unlock it first
- Look for the MetaMask icon in your browser extensions
- Click the MetaMask icon to open it
- Allow popup windows for localhost in your browser settings

### "User rejected" or connection cancelled
- You clicked "Reject" in MetaMask - try connecting again
- Click "Connect Wallet" and approve all MetaMask prompts

### Transaction fails
- Make sure you're connected to "Localhost 8545" network
- Ensure Anvil is running
- Check that your test account has ETH (Anvil accounts start with 10,000 ETH)
- Try resetting your account in MetaMask: Settings → Advanced → Reset Account

## Understanding the Blockchain Stack

```
┌─────────────────────┐
│   MediFlow UI       │  (Next.js Frontend)
│   localhost:3000    │
└──────────┬──────────┘
           │
           │ Web3 Connection
           │
┌──────────▼──────────┐
│     MetaMask        │  (Ethereum Wallet)
│   Browser Extension │
└──────────┬──────────┘
           │
           │ RPC Calls
           │
┌──────────▼──────────┐
│   Anvil/Foundry     │  (Local Ethereum Node)
│   localhost:8545    │
└──────────┬──────────┘
           │
           │ Smart Contracts
           │
┌──────────▼──────────┐
│  Smart Contracts    │
│  - AccessControl    │
│  - AuditLog         │
│  - MediFlow         │
└─────────────────────┘
```

## Why MetaMask Instead of Phantom?

| Feature | MetaMask | Phantom |
|---------|----------|---------|
| Blockchain | ✅ Ethereum | ❌ Solana |
| Smart Contracts | ✅ EVM Compatible | ❌ Different |
| MediFlow Support | ✅ Yes | ❌ No |
| FHIR + Blockchain | ✅ Works | ❌ Won't Work |

**MediFlow uses Ethereum smart contracts for:**
- Access Control (who can view records)
- Audit Logging (immutable access trails)
- IPFS hash storage (decentralized file storage)

All of this requires Ethereum, which Phantom doesn't support.

## Need Help?

If you're still having issues:
1. Check that Anvil is running: `npx anvil`
2. Check MetaMask is on "Localhost 8545" network
3. Check browser console for errors (F12 → Console)
4. Try restarting everything:
   - Stop Anvil (Ctrl+C)
   - Close MetaMask
   - Start Anvil again
   - Reopen browser
   - Connect wallet

## Security Notes

⚠️ **Development Only**
- The private keys in this guide are PUBLIC and for testing only
- NEVER use these keys with real cryptocurrency
- NEVER send real ETH to these test addresses
- Always use a separate wallet for development vs real transactions
