# Deploy to Sepolia Testnet

This guide walks you through deploying MediFlow smart contracts to Sepolia testnet.

## Prerequisites

✅ **Sepolia ETH**: You have 0.234 ETH (plenty for deployment + testing)
✅ **MetaMask**: Installed with your wallet
✅ **Foundry**: Already installed

## Step 1: Get Your Private Key

1. Open MetaMask
2. Click the account menu (three dots)
3. Select **"Account Details"**
4. Click **"Export Private Key"**
5. Enter your password
6. Copy the private key (starts with `0x`)

⚠️ **SECURITY WARNING**: Never share your private key or commit it to git!

## Step 2: Set Up Environment

Create a `.env` file (if you don't have one):

```bash
cp .env.example .env
```

Edit `.env` and add your private key:

```env
# For Sepolia deployment
PRIVATE_KEY=0xyour_actual_private_key_here

# Optional: Use Infura or Alchemy for better reliability
# Get free API key from infura.io or alchemy.com
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

## Step 3: Deploy Contracts to Sepolia

Run the deployment command:

```powershell
forge script script/Deploy.s.sol:Deploy --rpc-url https://rpc.sepolia.org --broadcast --verify
```

Or if you're using Infura/Alchemy:

```powershell
$env:SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_API_KEY"
forge script script/Deploy.s.sol:Deploy --rpc-url $env:SEPOLIA_RPC_URL --broadcast
```

**What happens:**
- Compiles contracts
- Deploys to Sepolia
- Costs ~0.01-0.02 ETH in gas
- Shows deployment addresses
- Saves transaction data to `broadcast/` folder

## Step 4: Save Contract Addresses

After deployment, you'll see output like:

```
MediFlowAccessControl deployed to: 0x1234...5678
MediFlowAuditLog deployed to: 0xabcd...ef01
```

**Update `lib/deployment.json`:**

```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contracts": {
    "MediFlowAccessControl": {
      "address": "0x1234...5678",
      "deployedAt": "2025-11-18T..."
    },
    "MediFlowAuditLog": {
      "address": "0xabcd...ef01",
      "deployedAt": "2025-11-18T..."
    }
  }
}
```

## Step 5: Configure MetaMask for Sepolia

1. Open MetaMask
2. Click network dropdown (top left)
3. Enable "Show test networks" in settings if not visible
4. Select **"Sepolia test network"**
5. Verify you see your ETH balance

**Network Details:**
- Network Name: Sepolia
- RPC URL: https://rpc.sepolia.org
- Chain ID: 11155111
- Currency: SepoliaETH
- Explorer: https://sepolia.etherscan.io

## Step 6: Test Complete Flow

### 6.1 Upload & Register Record

1. Start your app: `npm run dev`
2. Connect Wallet 1 (the one with Sepolia ETH)
3. Navigate to **Upload** page
4. Upload a medical record
5. ✅ MetaMask should popup for `registerRecord` transaction
6. Confirm and wait for transaction
7. Copy transaction hash

### 6.2 Share Record with Time Limit

1. Go to **Records** page
2. Click **"Share Record"** on your uploaded file
3. Enter Wallet 2 address (your second wallet)
4. Set access level: **Read**
5. Set time limit: **30 minutes** (for testing)
6. Enable audit trail
7. ✅ MetaMask should popup for `grantAccess` transaction
8. Confirm and wait for transaction
9. Copy transaction hash

### 6.3 Verify on Etherscan

Open both transactions on Sepolia Etherscan:
```
https://sepolia.etherscan.io/tx/0xYOUR_TX_HASH
```

Check:
- ✅ Transaction status: Success
- ✅ From address: Your Wallet 1
- ✅ To address: Contract address
- ✅ Gas used
- ✅ Block number
- ✅ Timestamp

### 6.4 View as Recipient

1. Switch MetaMask to Wallet 2
2. Refresh the app (it will detect new wallet)
3. Go to **Records** > **"Shared With Me"** tab
4. ✅ You should see the shared record
5. ✅ Countdown timer should be running (showing ~30 minutes)
6. ✅ Blockchain shield icon visible

### 6.5 Verify Smart Contract Enforcement

**Test 1: Access while valid**
- With Wallet 2, try to view the record
- ✅ Should work (within time limit)

**Test 2: Access after expiry** (wait for timer to reach 0)
- ✅ Record should auto-delete from UI
- ✅ If you try to access on-chain, `hasAccess()` will return false

**Test 3: Revoke access manually**
- Switch back to Wallet 1
- Go to **Access Control** page
- Click **"Revoke Access"** for Wallet 2
- ✅ MetaMask popup for `revokeAccess` transaction
- Switch to Wallet 2 and refresh
- ✅ Record should disappear from "Shared With Me"

## Expected Gas Costs

| Operation | Estimated Cost | Your Balance |
|-----------|---------------|--------------|
| Deploy AccessControl | ~0.005 ETH | ✅ 0.234 ETH |
| Deploy AuditLog | ~0.004 ETH | ✅ Sufficient |
| Register Record | ~0.002 ETH | ✅ Sufficient |
| Grant Access | ~0.003 ETH | ✅ Sufficient |
| Revoke Access | ~0.002 ETH | ✅ Sufficient |
| **Total for full test** | **~0.016 ETH** | **✅ You have plenty!** |

## Troubleshooting

### MetaMask doesn't popup
- Check you're on Sepolia network in MetaMask
- Check the app is connecting to Sepolia (F12 console should show Chain ID: 11155111)
- Verify `deployment.json` has correct Sepolia addresses

### Transaction fails
- Check you have enough Sepolia ETH
- Check gas price isn't too low
- Verify contract addresses are correct

### Shared record not appearing
- Wait for transaction to confirm (check Etherscan)
- Refresh the page
- Check browser console for errors
- Verify both wallets are on Sepolia network

## Verification

To verify contracts on Etherscan (optional):

```powershell
forge verify-contract <CONTRACT_ADDRESS> src/MediFlowAccessControl.sol:MediFlowAccessControl --chain sepolia --watch
```

## Next Steps

After successful testing:
1. 📸 Take screenshots of transactions on Etherscan
2. 📝 Document any issues or improvements
3. 🚀 Ready for production deployment on mainnet (when ready)

---

**Need Help?**
- Sepolia Faucet: https://sepoliafaucet.com/
- Etherscan: https://sepolia.etherscan.io/
- Foundry Docs: https://book.getfoundry.sh/
