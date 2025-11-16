# Foundry Installation and Setup for MediFlow

## Install Foundry on Windows

### Method 1: Using PowerShell (Recommended)

Run this in PowerShell:

```powershell
# Download and run foundryup
curl -L https://foundry.paradigm.xyz | bash
```

Then restart your terminal and run:
```powershell
foundryup
```

### Method 2: Using Scoop

```powershell
scoop install foundry
```

### Method 3: Using Cargo (if you have Rust installed)

```powershell
cargo install --git https://github.com/foundry-rs/foundry foundry-cli anvil --bins --locked
```

### Verify Installation

After installation, verify:

```powershell
forge --version
cast --version
anvil --version
```

---

## Quick Setup After Foundry is Installed

### Step 1: Initialize Foundry Project

```powershell
# Initialize foundry in contracts folder
forge init --force
```

### Step 2: Install Dependencies

```powershell
# Install OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts
```

### Step 3: Configure Foundry

The configuration is already set in `foundry.toml`

### Step 4: Build Contracts

```powershell
npm run blockchain:build
```

### Step 5: Start Local Blockchain (Anvil)

Open a **NEW terminal** and run:

```powershell
npm run blockchain:node
```

This starts Anvil (Foundry's local blockchain) on `http://localhost:8545`

### Step 6: Deploy Contracts

In your main terminal:

```powershell
npm run blockchain:deploy
```

### Step 7: Test Contracts

```powershell
npm run blockchain:test
```

---

## What Gets Created

```
website/
├── src/                           # Foundry smart contracts
│   ├── MediFlowAccessControl.sol
│   └── MediFlowAuditLog.sol
├── test/                          # Foundry tests
│   ├── MediFlowAccessControl.t.sol
│   └── MediFlowAuditLog.t.sol
├── script/                        # Deployment scripts
│   └── Deploy.s.sol
├── lib/                           # Dependencies (OpenZeppelin)
├── foundry.toml                   # Foundry config
└── deployment.json                # Deployed addresses
```

---

## Next Steps After Installation

1. **Install Foundry** (choose one method above)
2. **Run setup script**: The contracts and config are already created
3. **Start Anvil**: `npm run blockchain:node`
4. **Deploy**: `npm run blockchain:deploy`
5. **Test**: `npm run blockchain:test`

---

## Foundry vs Hardhat

**Why Foundry?**
- ⚡ 10x faster compilation
- 🦀 Written in Rust
- 🧪 Better testing with Solidity tests
- 📦 Native dependency management
- 🎯 Gas-optimized by default

---

## Troubleshooting

### "forge not found"
- Restart terminal after installation
- Add to PATH: `C:\Users\<YourUser>\.foundry\bin`

### "Permission denied"
- Run PowerShell as Administrator
- Set execution policy: `Set-ExecutionPolicy RemoteSigned`

### Still issues?
- Use WSL2 (Windows Subsystem for Linux) for best experience
- Or use the Hardhat setup instead

---

**Ready?** After installing Foundry, just run:

```powershell
npm run blockchain:build
npm run blockchain:node    # In separate terminal
npm run blockchain:deploy
```

You're done! 🚀
