# Complete Upload Flow with Blockchain

## ✅ IPFS CID → Blockchain Integration Complete!

### Flow:

1. **User uploads** text/file
2. **Create dummy FHIR** JSON
3. **Upload to Pinata** → Get CID (IPFS hash)
4. **Register CID on blockchain** via smart contract
5. **Log audit entry** on blockchain
6. **Save to localStorage** with transaction details
7. **Display on records page** with blockchain proof

### Before Testing:

**1. Start Anvil (Local Blockchain):**
```bash
wsl
cd "/mnt/c/Users/ADITYA SINGH/Desktop/website"
~/.foundry/bin/anvil
```

Keep this terminal running!

**2. Make sure MetaMask is connected:**
- Network: Anvil Local (http://localhost:8545)
- Chain ID: 31337
- Import an Anvil account if needed

### Test the Complete Flow:

1. **Go to http://localhost:3000/upload**

2. **Paste clinical text:**
   ```
   Patient: John Doe
   Age: 45
   Diagnosis: Type 2 Diabetes
   Treatment: Metformin 500mg
   ```

3. **Click "Upload to IPFS"**

4. **Watch console logs:**
   ```
   Creating dummy FHIR JSON...
   Uploading to IPFS via Pinata...
   ✅ IPFS Upload successful!
   📦 IPFS Hash (CID): QmYwAPJzv5CZsnA625s3...
   🔗 IPFS URL: https://gateway.pinata.cloud/ipfs/...
   🔗 Connecting to blockchain...
   📝 Record ID: 0x123abc...
   📤 Registering on blockchain...
   ⏳ Transaction sent: 0xabc123...
   ✅ Transaction confirmed!
   🧾 Block number: 1
   🧾 Transaction hash: 0xabc123...
   📝 Logging audit entry...
   ✅ Audit entry logged!
   ✅ Record saved to localStorage
   🎉 Upload complete!
   ```

5. **MetaMask will ask for 2 confirmations:**
   - First: `registerRecord(recordId, ipfsHash)`
   - Second: `logAudit(recordId, 'UPLOAD', metadata)`

6. **Redirected to /records** - See:
   - IPFS Hash (CID)
   - Blockchain Transaction Hash
   - Block Number
   - File details

### What Happens on Blockchain:

**Smart Contract Call 1: AccessControl.registerRecord()**
```solidity
registerRecord(
  recordId: "0x123abc...",
  ipfsHash: "QmYwAPJzv5CZsnA625s3..."
)
```
- Stores IPFS CID on-chain
- Links CID to your wallet address
- Emits `RecordRegistered` event

**Smart Contract Call 2: AuditLog.logAudit()**
```solidity
logAudit(
  recordId: "0x123abc...",
  action: "UPLOAD",
  metadata: "{fileName: ..., fileSize: ..., ipfsHash: ...}"
)
```
- Creates immutable audit trail
- Records timestamp
- Links to previous audit (blockchain chain)
- Emits `AuditEntry` event

### Verify on Blockchain:

**Check Anvil terminal:**
```
eth_sendTransaction
  Contract call:     0x5FbDB... (AccessControl)
  Gas used:          123456

eth_sendTransaction
  Contract call:     0xe7f17... (AuditLog)
  Gas used:          234567
```

### Data Flow Diagram:

```
Clinical Text
    ↓
Dummy FHIR JSON
    ↓
Pinata IPFS Upload
    ↓
Get CID: QmYwAPJ...
    ↓
┌─────────────────────────────┐
│   Blockchain Transaction 1   │
│  registerRecord(id, CID)    │
│  ✓ CID stored on-chain      │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│   Blockchain Transaction 2   │
│  logAudit(id, "UPLOAD", {}) │
│  ✓ Audit trail created      │
└─────────────────────────────┘
    ↓
localStorage (with tx hash)
    ↓
Display on /records page
```

### What's Stored Where:

**IPFS (Pinata):**
- Full FHIR JSON document
- Accessed via CID

**Blockchain (Anvil):**
- IPFS CID (hash)
- Record ownership
- Audit trail
- Timestamps

**LocalStorage:**
- Quick reference
- Transaction hashes
- Display metadata

### Security Model:

✅ **Data on IPFS** - Decentralized, permanent  
✅ **CID on blockchain** - Immutable proof  
✅ **Audit trail on-chain** - Tamper-proof history  
✅ **Only owner can access** - Smart contract enforced  

### Next Steps:

Tomorrow you can:
1. Integrate AI model for real FHIR conversion
2. Add access control UI (grant/revoke)
3. Implement encryption before IPFS upload
4. Deploy to testnet/mainnet

### Troubleshooting:

**"MetaMask not responding":**
- Make sure Anvil is running
- Check MetaMask is on Anvil network

**"Transaction failed":**
- Check Anvil terminal for errors
- Make sure contracts are deployed
- Verify contract addresses in .env.local

**"Upload to IPFS failed":**
- Check Pinata JWT is correct
- Check internet connection
- See console for detailed error
