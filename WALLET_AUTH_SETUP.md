# MediFlow - Wallet Authentication Setup

## Prerequisites

1. **PostgreSQL** - Database
2. **MetaMask** - Browser wallet extension
3. **Foundry (Anvil)** - Local blockchain (already installed)
4. **Node.js** - v18 or higher

## Quick Start

### 1. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Update DATABASE_URL in .env with your PostgreSQL credentials
DATABASE_URL="postgresql://user:password@localhost:5432/mediflow?schema=public"

# Add your OpenAI API key (for PDF to FHIR conversion)
OPENAI_API_KEY="your-openai-api-key"
```

### 2. Setup Database

```bash
# Run Prisma migration
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 3. Start Blockchain (Terminal 1)

```bash
# In WSL or separate terminal
anvil
```

Keep this running - it's your local blockchain.

### 4. Start Next.js App (Terminal 2)

```bash
npm run dev
```

App will run on `http://localhost:3000`

## How to Use

1. **Install MetaMask**: Add MetaMask browser extension if not installed
2. **Visit App**: Go to `http://localhost:3000`
3. **Connect Wallet**: Click "Connect Wallet" button
4. **Sign Message**: MetaMask will ask you to sign a message (free, no gas)
5. **Register**: If first time, enter your name to create account
6. **Dashboard**: View your wallet address and name on dashboard

## Features

- ✅ Wallet-based authentication (no password needed)
- ✅ User profile with name and wallet address visible
- ✅ Blockchain integration with smart contracts
- ✅ PDF to FHIR conversion with AI
- ✅ Decentralized access control
- ✅ Audit trail on blockchain

## Smart Contracts (Already Deployed to Local Anvil)

- **Access Control**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Audit Log**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

## Database Schema

**User Table:**
- `walletAddress` - Ethereum wallet address (unique)
- `name` - User's full name
- `aadhaarNumber` - Optional Aadhaar number
- `phoneNumber` - Optional phone number

## Pages

- `/connect-wallet` - Wallet connection and registration
- `/dashboard` - User dashboard showing profile
- `/upload` - Upload medical records
- `/records` - View all records
- `/access-control` - Manage access permissions

## Security Notes

- Wallet signature verification is done on sign-in
- All transactions are logged in audit trail
- Smart contracts manage access control
- No passwords stored - wallet is your identity

## Troubleshooting

**MetaMask not detected:**
- Install MetaMask browser extension
- Refresh the page

**Database connection error:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env

**Anvil not found:**
- Make sure you're in WSL terminal
- Run `forge --version` to verify installation
