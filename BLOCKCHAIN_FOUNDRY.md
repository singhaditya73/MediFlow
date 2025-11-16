# MediFlow Blockchain with Foundry - Quick Start

## ✅ You're All Set!

Smart contracts are ready. Just follow these 3 steps:

---

## Step 1: Install Foundry (If Not Already Installed)

### Windows (PowerShell as Administrator):

```powershell
# Using Scoop (easiest)
scoop install foundry

# OR using the installer
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Linux/Mac:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Verify Installation:

```powershell
forge --version
cast --version
anvil --version
```

---

## Step 2: Build & Test Smart Contracts

```powershell
# Build contracts
npm run blockchain:build

# Run tests
npm run blockchain:test
```

You should see:
```
[⠆] Compiling...
[⠰] Compiling 2 files with 0.8.20
Ran 14 tests for test/*.t.sol
Suite result: ok. 14 passed; 0 failed
```

---

## Step 3: Deploy to Local Blockchain

### Terminal 1 - Start Anvil (Local Blockchain):

```powershell
npm run blockchain:node
```

Keep this running! You'll see:
- 10 test accounts with 10,000 ETH each
- Private keys (safe for local dev)
- Listening on `http://localhost:8545`

### Terminal 2 - Deploy Contracts:

```powershell
npm run blockchain:deploy
```

You'll see:
```
MediFlowAccessControl deployed to: 0x5FbDB2315678...
MediFlowAuditLog deployed to: 0xe7f1725E7734...
```

---

## 🎉 Done! Your Blockchain is Running

### What You Have:
- ✅ Local Ethereum blockchain (Anvil)
- ✅ Smart contracts deployed
- ✅ Access control system active
- ✅ Audit logging enabled

### Test It:

```powershell
# Run tests with verbose output
npm run blockchain:test

# Check test coverage
npm run blockchain:coverage
```

---

## 🔧 Useful Commands

```powershell
# Build contracts
npm run blockchain:build

# Run tests (verbose)
npm run blockchain:test

# Start local blockchain
npm run blockchain:node

# Deploy contracts
npm run blockchain:deploy

# Get test coverage
npm run blockchain:coverage

# Clean build artifacts
forge clean
```

---

## 📁 Project Structure

```
website/
├── src/                              # Smart contracts
│   ├── MediFlowAccessControl.sol    # Access permissions
│   └── MediFlowAuditLog.sol         # Audit trail
├── test/                            # Foundry tests
│   ├── MediFlowAccessControl.t.sol
│   └── MediFlowAuditLog.t.sol
├── script/                          # Deployment scripts
│   └── Deploy.s.sol
├── foundry.toml                     # Foundry config
└── lib/                             # Dependencies (auto-created)
```

---

## 🧪 Interact with Contracts (Cast CLI)

```powershell
# Set contract address (from deployment output)
$CONTRACT="0x5FbDB2315678afecb367f032d93F642f64180aa3"

# Register a record
cast send $CONTRACT "registerRecord(string,string)" "record-1" "QmHash123" --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Check record owner
cast call $CONTRACT "getRecordOwner(string)" "record-1"

# Grant access
cast send $CONTRACT "grantAccess(string,address,uint8,uint256)" "record-1" "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" 1 0 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Check access
cast call $CONTRACT "hasAccess(string,address)" "record-1" "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
```

---

## 🌐 Connect MetaMask (Optional)

1. Open MetaMask → Add Network
2. Fill in:
   - **Network Name**: Anvil Local
   - **RPC URL**: `http://localhost:8545`
   - **Chain ID**: `31337`
   - **Currency**: `ETH`

3. Import Test Account:
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - You'll have 10,000 ETH for testing

---

## 🐛 Troubleshooting

### "forge not found"
- Restart your terminal after installing Foundry
- Or add to PATH: `C:\Users\<YourUser>\.foundry\bin`

### "Address already deployed"
- Restart Anvil: Stop (Ctrl+C) and run `npm run blockchain:node` again

### "Transaction failed"
- Check Anvil is running
- Verify contract address is correct
- Check you're using the right private key

---

## 📊 Test Results Example

```
Running 14 tests for test/MediFlowAccessControl.t.sol
[PASS] testRegisterRecord() (gas: 123456)
[PASS] testGrantAccess() (gas: 234567)
[PASS] testRevokeAccess() (gas: 187654)
[PASS] testExpiredAccess() (gas: 298765)
[PASS] testFailGrantAccessNotOwner() (gas: 176543)
...
Test result: ok. 14 passed; 0 failed
```

---

## 🚀 Next Steps

1. ✅ **Done**: Local blockchain running
2. 🔄 **Next**: Integrate with backend API
3. 🔄 **Then**: Add IPFS integration
4. 🔄 **Finally**: Deploy to testnet

---

## 📚 Foundry Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Forge Commands](https://book.getfoundry.sh/reference/forge/)
- [Cast Commands](https://book.getfoundry.sh/reference/cast/)
- [Anvil Guide](https://book.getfoundry.sh/reference/anvil/)

---

**Need more details?** Check `FOUNDRY_INSTALL.md` for full documentation!

🎯 **Ready to code!** Your blockchain is running. Start building! 🚀
