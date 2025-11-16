# MediFlow Blockchain Setup Guide

## Overview
This guide explains how to set up and use smart contracts for MediFlow in a local development environment using Hardhat.

## Architecture

```
Frontend/Backend
    ↓
Web3 Integration (ethers.js)
    ↓
Smart Contracts
    ↓
Local Hardhat Network
```

## Smart Contracts

### 1. MediFlowAccessControl.sol
Manages access permissions for health records on blockchain.

**Features:**
- Register health records
- Grant/revoke access permissions
- Set access levels (Read, Write, Full)
- Time-based access expiration
- Verify access rights

### 2. MediFlowAuditLog.sol
Immutable audit trail for all operations.

**Features:**
- Log all actions (create, view, update, delete, etc.)
- Cryptographic chain integrity
- Retrieve audit history
- Verify audit trail integrity

## Installation

### 1. Install Hardhat and Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers
```

### 2. Install TypeScript Support

```bash
npm install --save-dev typescript @types/node ts-node
```

## Project Structure

```
website/
├── contracts/                      # Solidity smart contracts
│   ├── MediFlowAccessControl.sol
│   └── MediFlowAuditLog.sol
├── scripts/                        # Deployment scripts
│   ├── deploy.ts
│   └── interact.ts
├── lib/
│   ├── blockchain.ts              # Web3 integration utilities
│   └── contracts/                 # Compiled ABIs
├── test/
│   └── contracts/                 # Contract tests
├── hardhat.config.ts              # Hardhat configuration
└── deployment.json                # Contract addresses (generated)
```

## Local Development Setup

### Step 1: Start Local Blockchain

Open a **separate terminal** and run:

```bash
npx hardhat node
```

This starts a local Ethereum network on `http://localhost:8545` with:
- Pre-funded test accounts
- Instant block mining
- Detailed logging

**Keep this terminal running!**

### Step 2: Compile Contracts

In your main terminal:

```bash
npx hardhat compile
```

This compiles Solidity contracts and generates:
- `artifacts/` - Compiled bytecode
- ABIs for contract interaction

### Step 3: Deploy Contracts

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

This will:
- Deploy both smart contracts
- Save contract addresses to `deployment.json`
- Save ABIs to `lib/contracts/`

**Output:**
```
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0 ETH
MediFlowAccessControl deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
MediFlowAuditLog deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ Deployment completed successfully!
```

### Step 4: Test Interaction

```bash
npx hardhat run scripts/interact.ts --network localhost
```

This demonstrates:
- Registering a health record
- Granting/revoking access
- Logging audit entries
- Querying blockchain data

## Integration with Backend

### Update Environment Variables

Add to `.env`:

```env
# Blockchain Configuration
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_CHAIN_ID=31337

# Private key of deployer account (from Hardhat node)
BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Example: Register Record with Blockchain

```typescript
import { registerRecordOnChain, logAuditOnChain } from "@/lib/blockchain";

// After creating FHIR record in database
const txHash = await registerRecordOnChain(fhirRecord.id, ipfsHash);

// Update record with blockchain transaction hash
await prismaClient.fhirRecord.update({
  where: { id: fhirRecord.id },
  data: { blockchainTxHash: txHash },
});

// Log audit on blockchain
await logAuditOnChain(fhirRecord.id, "create", JSON.stringify({
  resourceType: fhirRecord.resourceType,
  userId: user.id,
}));
```

### Example: Grant Access with Blockchain

```typescript
import { grantAccessOnChain } from "@/lib/blockchain";

// After creating access control in database
const txHash = await grantAccessOnChain(
  recordId,
  receiverWalletAddress,
  1, // Read access
  expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : 0
);

// Update access control with smart contract info
await prismaClient.accessControl.update({
  where: { id: accessControl.id },
  data: { 
    smartContractAddress: deployment.contracts.MediFlowAccessControl 
  },
});
```

## Testing Smart Contracts

### Create Test File

Create `test/contracts/MediFlowAccessControl.test.ts`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MediFlowAccessControl", function () {
  let accessControl: any;
  let owner: any;
  let user1: any;
  
  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const AccessControl = await ethers.getContractFactory("MediFlowAccessControl");
    accessControl = await AccessControl.deploy();
  });
  
  it("Should register a record", async function () {
    await accessControl.registerRecord("record-1", "QmHash");
    const recordOwner = await accessControl.getRecordOwner("record-1");
    expect(recordOwner).to.equal(owner.address);
  });
  
  it("Should grant and check access", async function () {
    await accessControl.registerRecord("record-1", "QmHash");
    await accessControl.grantAccess("record-1", user1.address, 1, 0);
    const hasAccess = await accessControl.hasAccess("record-1", user1.address);
    expect(hasAccess).to.be.true;
  });
});
```

### Run Tests

```bash
npx hardhat test
```

## Useful Commands

### Hardhat Console
```bash
npx hardhat console --network localhost
```

Interact with contracts directly:
```javascript
const AccessControl = await ethers.getContractFactory("MediFlowAccessControl");
const contract = await AccessControl.attach("0x5FbDB...");
await contract.registerRecord("test-record", "QmHash");
```

### Get Account Balances
```bash
npx hardhat run scripts/get-accounts.ts --network localhost
```

### Clear Artifacts
```bash
npx hardhat clean
```

### Check Contract Size
```bash
npx hardhat size-contracts
```

## Production Deployment

### Deploy to Testnet (e.g., Sepolia)

1. Get testnet ETH from faucet
2. Update `.env`:
   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   PRIVATE_KEY=your_private_key
   ```

3. Deploy:
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

### Deploy to Polygon

1. Update `hardhat.config.ts`:
   ```typescript
   polygon: {
     url: "https://polygon-rpc.com",
     accounts: [process.env.PRIVATE_KEY],
   }
   ```

2. Deploy:
   ```bash
   npx hardhat run scripts/deploy.ts --network polygon
   ```

## Security Considerations

### For Local Development:
✅ Use test accounts with no real value
✅ Keep private keys in `.env` (never commit)
✅ Test thoroughly before mainnet

### For Production:
- Use hardware wallets for deployment
- Audit smart contracts
- Use multi-sig wallets for contract ownership
- Implement upgradeable contracts pattern
- Set up monitoring and alerts

## Troubleshooting

### "Cannot connect to localhost:8545"
- Ensure Hardhat node is running: `npx hardhat node`
- Check if port 8545 is available

### "Transaction reverted"
- Check contract state requirements
- Verify you're the record owner for restricted functions
- Check access permissions

### "Gas estimation failed"
- Transaction would fail
- Check function parameters
- Verify contract state

### "Nonce too high"
- Reset Hardhat node: Stop and restart
- Clear MetaMask nonce (Settings → Advanced → Reset Account)

## MetaMask Integration (Optional)

### Add Hardhat Network to MetaMask

1. Open MetaMask
2. Add Network:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

3. Import Test Account:
   - Use private key from Hardhat node output
   - Account will have 10,000 ETH for testing

## Next Steps

1. ✅ Set up local blockchain
2. ✅ Deploy smart contracts
3. ✅ Test contract interactions
4. 🔄 Integrate with backend API
5. 🔄 Add frontend Web3 wallet connection
6. 🔄 Implement IPFS integration
7. 🔄 Deploy to testnet
8. 🔄 Security audit
9. 🔄 Deploy to mainnet

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org)
- [Solidity Documentation](https://docs.soliditylang.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

## License

MIT License
