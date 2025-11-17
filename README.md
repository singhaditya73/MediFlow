# Mediflow 🏥
⸻
# MediFlow 🏥

**Decentralized Healthcare Data Management Platform**

MediFlow transforms healthcare data management by giving patients full ownership of their medical records through a secure, decentralized platform. We standardize medical records into FHIR format, store them safely using IPFS and Blockchain, and enable time-limited access control with complete audit trails.

---

## 🌟 Key Features

- 🩺 **FHIR Integration**: Converts medical documents into standardized FHIR resources
- 🔗 **Web3 & Blockchain**: Secure, tamper-proof access with immutable audit trail (Sepolia testnet ready)
- 📂 **Decentralized Storage**: IPFS/Pinata integration for high availability and privacy
- 🛡️ **Smart Contracts**: Automated access permissions with time-limited sharing (5-hour default)
- ⏱️ **Time-Based Access**: Records automatically expire after set duration with countdown timer
- 🔐 **Wallet Authentication**: MetaMask integration for secure identity verification
- 🔒 **End-to-End Security**: Only file owners can grant/revoke access
- 📊 **Audit Trail**: Complete blockchain-based activity logs for transparency

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask wallet
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/singhaditya73/MediFlow.git
cd MediFlow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Add your Pinata JWT for IPFS
# NEXT_PUBLIC_PINATA_JWT=your_jwt_here

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

---

## 📦 Project Structure

```
MediFlow/
├── app/                    # Next.js pages
│   ├── upload/            # File upload & IPFS integration
│   ├── records/           # View & manage records
│   ├── access-control/    # Grant/revoke access
│   ├── audit-trail/       # Blockchain audit logs
│   └── signup/            # Wallet connection
├── components/            # React components
│   ├── countdown-timer.tsx
│   ├── share-record-modal.tsx
│   └── ui/               # shadcn/ui components
├── lib/                   # Core utilities
│   ├── blockchain.ts      # Smart contract interactions
│   ├── ipfs.ts           # IPFS/Pinata integration
│   ├── wallet.ts         # MetaMask utilities
│   └── networks.json     # Contract addresses
├── contracts/            # Solidity smart contracts
│   ├── MediFlowAccessControl.sol
│   └── MediFlowAuditLog.sol
├── script/               # Foundry deployment scripts
└── test/                 # Smart contract tests
```

---

## 🔐 Smart Contracts (Sepolia Testnet)

**Deployed Contracts:**
- **AccessControl**: `0xFA7d82c7B461c6535861cb2306e22a50eacc0D45`
- **AuditLog**: `0x62BCb433f042873D8CB1B13180b96192E2A176A1`

**View on Etherscan:**
- [AccessControl Contract](https://sepolia.etherscan.io/address/0xFA7d82c7B461c6535861cb2306e22a50eacc0D45)
- [AuditLog Contract](https://sepolia.etherscan.io/address/0x62BCb433f042873D8CB1B13180b96192E2A176A1)

### Key Smart Contract Features:
- ✅ Owner-only access management
- ✅ Time-limited permissions (Unix timestamp expiry)
- ✅ Immutable audit trail
- ✅ IPFS hash storage
- ✅ Gas-optimized operations

---

## 🎯 User Flow

1. **Connect Wallet** → MetaMask authentication with Sepolia testnet
2. **Upload Record** → Medical data → IPFS → Blockchain registration
3. **Share Record** → Grant time-limited access (e.g., 5 hours)
4. **Countdown Timer** → Real-time expiration tracking
5. **Auto-Expire** → Access automatically revoked after time limit
6. **Audit Trail** → View all access activities on blockchain

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion

**Blockchain:**
- Solidity smart contracts
- Foundry (development & deployment)
- ethers.js v6
- MetaMask integration

**Storage:**
- IPFS (via Pinata)
- localStorage (client-side caching)

**Network:**
- Sepolia Testnet (Chain ID: 11155111)
- Localhost (Chain ID: 31337)

---

## 📝 Environment Variables

Create `.env.local` with:

```env
# Pinata IPFS
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud

# Optional: Localhost contracts (auto-detected)
NEXT_PUBLIC_ACCESS_CONTROL_CONTRACT=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_AUDIT_LOG_CONTRACT=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

Get your Pinata JWT from [Pinata Dashboard](https://app.pinata.cloud/)

---

## 🔧 Development

### Run locally:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
npm start
```

### Smart contract testing:
```bash
# Using Foundry
forge test

# With verbosity
forge test -vvv
```

### Deploy to Sepolia:
```bash
# See DEPLOY_SEPOLIA.md for detailed instructions
forge script script/Deploy.s.sol:Deploy --rpc-url $SEPOLIA_RPC --broadcast
```

---

## 🎨 Features in Detail

### Time-Limited Access
- Set custom expiration (default: 5 hours)
- Visual countdown timer (DD:HH:MM:SS)
- Color-coded urgency (green → orange → red)
- Auto-cleanup on expiration

### Security
- Only file owner can share
- MetaMask signature verification
- Blockchain-enforced permissions
- End-to-end encryption ready

### Error Handling
- ✅ MetaMask connection errors
- ✅ Transaction rejection handling
- ✅ Network validation
- ✅ IPFS timeout protection (30s)
- ✅ Insufficient funds detection
- ✅ User-friendly error messages

---

## 📖 Documentation

- **Deployment Guide**: See `DEPLOY_SEPOLIA.md`
- **Smart Contracts**: Check `/contracts` directory
- **Network Config**: See `/lib/networks.json`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Contributors

- **Aditya Singh**
- **Abhishek Jain** 
- **Aditya Veer Singh** 

---

## 🙏 Acknowledgments

- [FHIR Standard](https://www.hl7.org/fhir/)
- [IPFS/Pinata](https://www.pinata.cloud/)
- [Foundry](https://book.getfoundry.sh/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🔗 Links

- **GitHub**: [github.com/singhaditya73/MediFlow](https://github.com/singhaditya73/MediFlow)
- **Sepolia Etherscan**: [sepolia.etherscan.io](https://sepolia.etherscan.io)

---

**MediFlow — Where Patients Own Their Health! 🌐🩺**
⸻

## Key Features
	•	🩺 FHIR Integration: Converts unstructured medical prescriptions and documents into standardized FHIR resources.
	•	🔗 Web3 & Blockchain: Ensures secure, tamper-proof access and an immutable audit trail for all medical data.
	•	📂 Decentralized Storage (IPFS): Guarantees high availability, resilience, and privacy for patient data.
	•	🛡️ Smart Contracts: Automates and secures access permissions — patients can easily grant or revoke access.
	•	🧠 Machine Learning + NLP: Extracts structured information from scanned prescriptions and documents.
	•	🆔 Aadhaar Linking: Creates a unique, verifiable health identity for each patient.
	•	🔒 Advanced Encryption: End-to-end encryption of all medical data, compliant with HIPAA and global privacy laws.

![2](https://github.com/user-attachments/assets/c4245b9f-a341-4762-bbb3-dbba158a3e4c)

[Mediflow.pdf](https://github.com/user-attachments/files/19937312/Mediflow.pdf)


⸻
## How it Works
	1.	Upload Medical Records
	•	Patients upload prescriptions or lab reports via the platform.
	2.	AI-Based Processing
	•	Machine Learning + NLP models extract and organize text into FHIR-compliant structures.
	3.	FHIR Resource Creation
	•	The extracted data is converted into standardized FHIR DiagnosticReport or Patient resources.
	4.	Decentralized Storage
	•	FHIR resources are stored securely on IPFS, ensuring distributed, tamper-proof storage.
	5.	Blockchain Access Control
	•	Access rights are managed through blockchain smart contracts, with full control given to the patient.
	6.	Identity Linking
	•	Patients can link their FHIR identity to their Aadhaar number for seamless verification.

⸻

## Tech Stack 🛠️
	•	Machine Learning: Python, Tesseract OCR, NLP models
	•	Backend: Node.js / Express
	•	Blockchain: Solidity (Ethereum / Polygon / any EVM chain)
	•	Storage: IPFS
	•	FHIR Standard: JSON structures
	•	Frontend: React.js / Next.js (Vercel hosting)

## License

This project is licensed under the MIT License.
Feel free to use, contribute, and share!

⸻

## Contributors ✨

	•	Aditya Singh
	•	Abhishek Jain 
	•	Aditya Veer Singh

⸻

# Let’s Mediflow — Where Patients Own Their Health! 🌐🩺
