# IPFS Storage & Upload Flow

## Overview
This implements the complete flow: **Text/File → FHIR → IPFS → Blockchain**

## Files Created

### 1. `lib/ipfs.ts` - IPFS Storage Service
Handles uploading and retrieving files from IPFS.

**Key Functions:**
- `uploadToIPFS(fhirData)` - Upload FHIR JSON to IPFS, returns hash
- `fetchFromIPFS(hash)` - Retrieve data from IPFS by hash
- `pinToIPFS(hash)` - Pin content permanently
- `checkIPFSAvailability(hash)` - Check if content exists

**IPFS Providers Supported:**
1. Web3.Storage (requires `NEXT_PUBLIC_WEB3_STORAGE_TOKEN`)
2. Pinata (requires `NEXT_PUBLIC_PINATA_JWT`)
3. NFT.Storage (requires `NEXT_PUBLIC_NFT_STORAGE_TOKEN`)
4. Development fallback (generates mock hash)

### 2. `lib/uploadFlow.ts` - Complete Upload Flow
End-to-end upload implementation with blockchain integration.

**Key Functions:**
- `uploadHealthRecord(clinicalText, patientName, walletAddress)` - Upload text record
- `uploadFileRecord(file, walletAddress)` - Upload file record

**Flow Steps:**
1. Convert text/file to FHIR JSON
2. Upload FHIR to IPFS → Get hash
3. Register record on smart contract with IPFS hash
4. Log audit entry on blockchain
5. Save record to localStorage

## Usage Example

```typescript
import { uploadHealthRecord } from '@/lib/uploadFlow';

// In your upload page component
const handleUpload = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const result = await uploadHealthRecord(
      clinicalText,
      user.name,
      user.walletAddress
    );

    console.log('Upload successful!');
    console.log('Record ID:', result.recordId);
    console.log('IPFS Hash:', result.ipfsHash);
    console.log('IPFS URL:', result.ipfsUrl);
    console.log('Transaction Hash:', result.transactionHash);

    // Redirect to records page
    router.push('/records');
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Upload failed. Please try again.');
  }
};
```

## Setup Instructions

### 1. Get IPFS API Keys (Choose One)

**Option A: Web3.Storage (Recommended)**
1. Go to https://web3.storage
2. Sign up with GitHub
3. Get API token
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token_here
   ```

**Option B: Pinata**
1. Go to https://pinata.cloud
2. Sign up for free account
3. Create API key
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_PINATA_JWT=your_jwt_here
   ```

**Option C: NFT.Storage**
1. Go to https://nft.storage
2. Sign up
3. Get API key
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_NFT_STORAGE_TOKEN=your_token_here
   ```

**Option D: Development Mode**
- No API key needed
- Uses mock IPFS hashes for testing
- Perfect for local development

### 2. Start Anvil (Local Blockchain)

```bash
wsl
cd "/mnt/c/Users/ADITYA SINGH/Desktop/website"
~/.foundry/bin/anvil
```

Keep this running in the background.

### 3. Connect MetaMask to Anvil

1. Open MetaMask
2. Add Network:
   - Network Name: **Anvil Local**
   - RPC URL: **http://localhost:8545**
   - Chain ID: **31337**
   - Currency Symbol: **ETH**
3. Import an Anvil account (copy private key from Anvil terminal)

### 4. Use in Your App

```typescript
// app/upload/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadHealthRecord } from '@/lib/uploadFlow';

export default function UploadPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const result = await uploadHealthRecord(
        text,
        user.name,
        user.walletAddress
      );

      alert(`Upload successful! IPFS Hash: ${result.ipfsHash}`);
      router.push('/records');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter clinical text..."
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload to IPFS & Blockchain'}
      </button>
    </div>
  );
}
```

## How It Works

1. **User enters clinical text** or uploads file
2. **Convert to FHIR**: Text → FHIR JSON format
3. **Upload to IPFS**: FHIR JSON → IPFS → Get hash (e.g., `QmX123...`)
4. **Register on Blockchain**: 
   - Call `registerRecord(recordId, ipfsHash)` on AccessControl contract
   - Call `logAudit(recordId, 'UPLOAD', metadata)` on AuditLog contract
5. **Save to localStorage**: Store record with IPFS hash for quick access
6. **User can view records**: Fetch from IPFS using hash, decrypt if needed

## Storage Architecture

```
Clinical Text
    ↓
[Convert to FHIR]
    ↓
FHIR JSON
    ↓
[Upload to IPFS] ←→ IPFS Network (Decentralized)
    ↓
IPFS Hash (QmX123...)
    ↓
[Register on Blockchain] ←→ Ethereum Smart Contract
    ↓
Transaction Hash (0xabc...)
    ↓
[Save to LocalStorage] ←→ Browser Storage (Fast Access)
```

## Smart Contract Addresses

- **MediFlowAccessControl**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **MediFlowAuditLog**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

## Next Steps

1. ✅ IPFS integration complete
2. ✅ Upload flow with blockchain registration
3. ⏳ Integrate with upload page UI
4. ⏳ Implement view records from IPFS
5. ⏳ Add encryption before IPFS upload
6. ⏳ Build access control UI

## Troubleshooting

**IPFS upload fails:**
- Check API key is set correctly
- Try different IPFS provider
- Use development mode (no API key needed)

**Smart contract transaction fails:**
- Ensure Anvil is running
- Check MetaMask is connected to Anvil network
- Verify you have enough ETH (Anvil provides test ETH)

**Record not saving:**
- Check localStorage has space
- Verify user is logged in
- Check browser console for errors
