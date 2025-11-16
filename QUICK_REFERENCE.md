# 🚀 MediFlow - Quick Command Reference

## 📦 First Time Setup (Do Once)

```powershell
# 1. Install Foundry (Run as Administrator)
.\install-foundry.ps1

# 2. Install npm dependencies
npm install

# 3. Setup database
npx prisma migrate dev
npx prisma generate

# 4. Build smart contracts
npm run blockchain:build

# 5. Test smart contracts
npm run blockchain:test
```

---

## ⚡ Daily Development Workflow

### Start All Services (3 Terminals)

**Terminal 1 - Blockchain:**
```powershell
npm run blockchain:node
```
→ Keep running! Local blockchain on http://localhost:8545

**Terminal 2 - Deploy Contracts (First time or after changes):**
```powershell
npm run blockchain:deploy
```
→ Deploys smart contracts to local chain

**Terminal 3 - Next.js App:**
```powershell
npm run dev
```
→ App running on http://localhost:3000

---

## 🔧 Common Commands

### Blockchain
```powershell
npm run blockchain:build      # Compile contracts
npm run blockchain:test       # Run tests
npm run blockchain:node       # Start Anvil
npm run blockchain:deploy     # Deploy contracts
npm run blockchain:coverage   # Test coverage
forge clean                   # Clean build artifacts
```

### Database
```powershell
npx prisma studio             # Visual database editor
npx prisma migrate dev        # Create & run migration
npx prisma generate           # Update Prisma Client
npx prisma migrate reset      # Reset database (⚠️ deletes data)
```

### Application
```powershell
npm run dev                   # Development server
npm run build                 # Production build
npm run start                 # Production server
npm run lint                  # Lint code
```

---

## 🆘 Troubleshooting

### ❌ "forge not found"
```powershell
# Install Foundry
.\install-foundry.ps1

# Then restart terminal
```

### ❌ "Contract not deployed"
```powershell
# Terminal 1:
npm run blockchain:node

# Terminal 2:
npm run blockchain:deploy
```

### ❌ "Database error"
```powershell
# Check .env has correct DATABASE_URL
npx prisma migrate reset
npx prisma migrate dev
```

### ❌ "Port already in use"
```powershell
# Find and kill process
netstat -ano | findstr :8545   # or :3000
taskkill /PID <PID> /F
```

---

## 📱 Test Accounts (Anvil)

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

(All have 10,000 ETH - safe for local development only!)
```

---

## 🧪 Quick Tests

### Test Smart Contracts
```powershell
npm run blockchain:test
```

### Test API
```powershell
# 1. Start app
npm run dev

# 2. Test signup
curl -X POST http://localhost:3000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'
```

### Interact with Contracts
```powershell
# Set contract address (from deployment output)
$CONTRACT="0x5FbDB2315678afecb367f032d93F642f64180aa3"

# Register a record
cast send $CONTRACT "registerRecord(string,string)" "record-1" "QmHash" --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Check owner
cast call $CONTRACT "getRecordOwner(string)" "record-1"
```

---

## 📂 Quick File Reference

```
Key Files to Know:
├── src/                          ← Smart contracts here
│   ├── MediFlowAccessControl.sol
│   └── MediFlowAuditLog.sol
├── app/api/                      ← Backend API routes
│   ├── upload/route.ts           ← PDF upload
│   ├── convert/route.ts          ← Text conversion
│   ├── records/route.ts          ← Record management
│   └── access-control/route.ts   ← Permissions
├── prisma/schema.prisma          ← Database schema
├── foundry.toml                  ← Foundry config
├── .env                          ← Environment variables
└── package.json                  ← All npm scripts
```

---

## 🎯 Development Checklist

- [ ] Foundry installed (`forge --version`)
- [ ] Database running (PostgreSQL)
- [ ] `.env` file configured
- [ ] Contracts compiled (`npm run blockchain:build`)
- [ ] Tests passing (`npm run blockchain:test`)
- [ ] Anvil running (Terminal 1)
- [ ] Contracts deployed (Terminal 2)
- [ ] App running (Terminal 3: `npm run dev`)

---

## 💡 Pro Tips

```powershell
# Watch mode for contract development
forge test --watch

# Check gas usage
forge test --gas-report

# Format Solidity code
forge fmt

# Get help
forge --help
cast --help
anvil --help
```

---

## 📊 Check Status

```powershell
# Check Foundry
forge --version

# Check Node packages
npm list --depth=0

# Check database connection
npx prisma db pull

# Check Anvil is running
curl http://localhost:8545 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 🎓 Learn More

- **Full Setup**: `README_COMPLETE.md`
- **API Docs**: `API_DOCUMENTATION.md`
- **Blockchain**: `BLOCKCHAIN_FOUNDRY.md`
- **Backend**: `BACKEND_SUMMARY.md`

---

**Need help?** Check the full documentation files! 📚

**Ready to build?** Start all 3 terminals and code! 🚀
