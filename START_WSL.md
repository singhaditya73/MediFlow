# Running Anvil in WSL (Windows Subsystem for Linux)

## Prerequisites

### 1. Install WSL
If you don't have WSL installed:

```powershell
# Run in PowerShell as Administrator
wsl --install
```

Restart your computer after installation.

### 2. Install Foundry in WSL

Open WSL terminal (type `wsl` in PowerShell or open Ubuntu app):

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Restart your terminal or run:
source ~/.bashrc

# Install Foundry tools
foundryup
```

Verify installation:
```bash
anvil --version
# Should show: anvil 0.2.0 or similar
```

## Starting Anvil in WSL

### Method 1: Manual Start

Open WSL terminal:
```bash
cd /mnt/c/Users/ADITYA\ SINGH/Desktop/website
anvil --host 0.0.0.0 --port 8545
```

**Important:** Use `--host 0.0.0.0` to allow connections from Windows!

### Method 2: Using NPM Script (Recommended)

Update your `package.json` to use WSL:

```json
{
  "scripts": {
    "blockchain:node": "wsl anvil --host 0.0.0.0 --port 8545",
    "blockchain:node:verbose": "wsl anvil --host 0.0.0.0 --port 8545 --block-time 1"
  }
}
```

Then run from PowerShell:
```powershell
npm run blockchain:node
```

### Method 3: Create WSL Startup Script

Create `start-anvil-wsl.sh` in your project:

```bash
#!/bin/bash
echo "================================"
echo "   Starting Anvil in WSL       "
echo "================================"
echo ""
echo "Blockchain will run on: http://127.0.0.1:8545"
echo "Chain ID: 31337"
echo ""
anvil --host 0.0.0.0 --port 8545
```

Make it executable:
```bash
chmod +x start-anvil-wsl.sh
```

Run it:
```bash
./start-anvil-wsl.sh
```

## Network Configuration

### MetaMask Settings
```
Network Name: Localhost 8545
RPC URL: http://127.0.0.1:8545  (or http://localhost:8545)
Chain ID: 31337
Currency Symbol: ETH
```

### Testing Connection from Windows

In PowerShell:
```powershell
# Test if Anvil is accessible from Windows
curl http://127.0.0.1:8545 -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

If you get a response, it's working! ✅

## Common WSL + Anvil Issues

### ❌ "Connection refused" from Windows
**Problem:** Anvil running in WSL but Windows can't connect

**Solutions:**

1. **Use `--host 0.0.0.0`** (most important!)
   ```bash
   anvil --host 0.0.0.0 --port 8545
   ```

2. **Check WSL firewall:**
   ```bash
   sudo ufw status
   # If active, allow port 8545
   sudo ufw allow 8545
   ```

3. **Check Windows Firewall:**
   - Windows Security → Firewall → Allow an app
   - Make sure Node.js and WSL are allowed

### ❌ "Port already in use"
**Problem:** Port 8545 is taken

**Solution:**
```bash
# Find what's using the port
sudo lsof -i :8545

# Kill the process
sudo kill -9 <PID>

# Or use a different port
anvil --host 0.0.0.0 --port 8546
```

### ❌ WSL command not found in package.json
**Problem:** `wsl: command not found` when running npm scripts

**Solution:** Make sure you're running npm from Windows PowerShell, not from WSL!

### ❌ Path issues with Windows/WSL
**Problem:** Can't access files

**Windows paths in WSL:**
- `C:\Users\...` becomes `/mnt/c/Users/...`
- Spaces in paths need escaping: `/mnt/c/Users/ADITYA\ SINGH/...`

### ❌ Anvil slow or hanging
**Problem:** WSL2 can be slower than native

**Solution:**
```bash
# Add to anvil command for faster mining
anvil --host 0.0.0.0 --port 8545 --block-time 1 --no-mining
```

## Complete Workflow

### Terminal Setup

**Terminal 1 (WSL):** Start Anvil
```bash
# Open WSL
wsl

# Navigate to project
cd /mnt/c/Users/ADITYA\ SINGH/Desktop/website

# Start Anvil with correct host
anvil --host 0.0.0.0 --port 8545
```

**Terminal 2 (PowerShell):** Start Next.js
```powershell
# Stay in PowerShell
cd "c:\Users\ADITYA SINGH\Desktop\website"

# Start dev server
npm run dev
```

### Quick Commands

```bash
# In WSL - Check if Anvil is installed
which anvil

# In WSL - Start Anvil
anvil --host 0.0.0.0 --port 8545

# In PowerShell - Test connection
curl http://127.0.0.1:8545 -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}'

# In PowerShell - Start dev server
npm run dev
```

## Recommended: Update package.json

Update your scripts to use WSL automatically:

```json
{
  "scripts": {
    "dev": "next dev",
    "blockchain:node": "wsl -e bash -c 'cd /mnt/c/Users/ADITYA\\ SINGH/Desktop/website && anvil --host 0.0.0.0 --port 8545'",
    "blockchain:deploy": "wsl -e bash -c 'cd /mnt/c/Users/ADITYA\\ SINGH/Desktop/website && forge script script/Deploy.s.sol:Deploy --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast'"
  }
}
```

Then you can just run:
```powershell
npm run blockchain:node
```

## Troubleshooting Checklist

- [ ] WSL is installed (`wsl --version` in PowerShell)
- [ ] Foundry is installed in WSL (`wsl anvil --version`)
- [ ] Anvil starts with `--host 0.0.0.0` flag
- [ ] Port 8545 is not blocked by firewall
- [ ] Can curl http://127.0.0.1:8545 from Windows
- [ ] MetaMask RPC URL is http://127.0.0.1:8545 or http://localhost:8545
- [ ] Next.js dev server is running from Windows PowerShell

## Test Accounts

When Anvil starts, you'll see test accounts. Import one to MetaMask:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Balance: 10,000 ETH (fake test money)

## WSL vs Native Windows

| Aspect | WSL (Recommended) | Native Windows |
|--------|-------------------|----------------|
| Setup | Requires WSL install | Needs Windows Foundry build |
| Performance | Good | Can be slower |
| Compatibility | ✅ Best | ⚠️ Some issues |
| Updates | Easy (`foundryup`) | Manual download |
| Recommendation | ✅ Use this | ❌ Avoid |

## Summary

1. Install WSL: `wsl --install` (PowerShell as Admin)
2. Install Foundry in WSL: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
3. Start Anvil: `anvil --host 0.0.0.0 --port 8545`
4. Connect MetaMask to http://127.0.0.1:8545
5. Start Next.js in PowerShell: `npm run dev`

**Key Point:** Always use `--host 0.0.0.0` when running Anvil in WSL!
