# Pinata IPFS Setup Guide

## Why Pinata?

Pinata is the **best choice** for IPFS storage in production because:

✅ **Always returns IPFS CID** - Every upload returns a unique Content Identifier (hash)  
✅ **Dedicated gateways** - Fast, reliable access to your content  
✅ **Automatic pinning** - Your content stays available permanently  
✅ **Free tier** - 1GB storage + 100GB bandwidth/month  
✅ **Easy authentication** - Simple JWT or API key  
✅ **Metadata support** - Tag and organize your files  

## Quick Setup (5 minutes)

### Step 1: Create Pinata Account

1. Go to https://pinata.cloud
2. Click **"Sign Up"** (free account)
3. Verify your email

### Step 2: Generate API Key

1. Go to **API Keys** page: https://app.pinata.cloud/keys
2. Click **"New Key"** button
3. Configure permissions:
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS`
   - ✅ `unpin`
   - ✅ `pinList`
4. Give it a name: "MediFlow App"
5. Click **"Create Key"**
6. **Copy the JWT token** (you won't see it again!)

### Step 3: Add to Your Project

Create or edit `.env.local` in your project root:

```bash
# Pinata Configuration
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_jwt_here

# Optional: Custom Pinata Gateway (if you have a dedicated gateway)
# NEXT_PUBLIC_PINATA_GATEWAY=your-gateway.mypinata.cloud
```

**Important:** 
- Replace `your_actual_jwt_here` with your real JWT token
- Keep this file secret (already in `.gitignore`)
- Use `NEXT_PUBLIC_` prefix for client-side access

### Step 4: Test Upload

```typescript
import { uploadToIPFS } from '@/lib/ipfs';

const fhirData = {
  resourceType: "Patient",
  id: "example",
  name: [{ text: "John Doe" }]
};

const result = await uploadToIPFS(fhirData);
console.log('IPFS Hash:', result.hash);
// Output: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"

console.log('URL:', result.url);
// Output: "https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
```

## How It Works

### Upload Flow

```
FHIR JSON Object
    ↓
uploadToIPFS()
    ↓
[POST to Pinata API]
    ↓
Pinata stores & pins to IPFS
    ↓
Returns CID (hash)
    ↓
"QmYwAPJzv5..."
```

### Retrieve Flow

```
IPFS Hash (CID)
    ↓
fetchFromIPFS(hash)
    ↓
[Try Pinata gateway first]
    ↓
[Fallback to public gateways]
    ↓
Returns FHIR JSON Object
```

## API Functions

### `uploadToIPFS(fhirData)`

Uploads FHIR JSON to IPFS via Pinata.

```typescript
const result = await uploadToIPFS({
  resourceType: "DocumentReference",
  status: "current",
  content: [...]
});

// Returns:
{
  hash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  size: 2048,
  url: "https://gateway.pinata.cloud/ipfs/QmYwAPJzv..."
}
```

**Features:**
- Automatic JSON formatting
- Metadata tagging (timestamp, type)
- CIDv1 for better compatibility
- Automatic pinning

### `fetchFromIPFS(hash)`

Retrieves data from IPFS by CID.

```typescript
const data = await fetchFromIPFS("QmYwAPJzv5...");
// Returns original FHIR JSON object
```

**Features:**
- Tries Pinata gateway first (fastest)
- Falls back to public gateways
- Automatic retry logic

### `pinToIPFS(hash)`

Pin existing IPFS content (keep it permanent).

```typescript
const success = await pinToIPFS("QmYwAPJzv5...");
// Returns true if pinned successfully
```

### `listPinnedFiles()`

List all your pinned files on Pinata.

```typescript
const files = await listPinnedFiles();
// Returns array of pinned files with metadata
```

### `unpinFromIPFS(hash)`

Remove pin from Pinata (content may be removed).

```typescript
const success = await unpinFromIPFS("QmYwAPJzv5...");
// Returns true if unpinned successfully
```

## Complete Example

```typescript
'use client';

import { useState } from 'react';
import { uploadToIPFS, fetchFromIPFS } from '@/lib/ipfs';

export default function IPFSDemo() {
  const [hash, setHash] = useState('');
  const [data, setData] = useState(null);

  // Upload FHIR data
  const handleUpload = async () => {
    const fhirData = {
      resourceType: "Observation",
      status: "final",
      code: {
        text: "Blood Pressure"
      },
      valueQuantity: {
        value: 120,
        unit: "mmHg"
      }
    };

    try {
      const result = await uploadToIPFS(fhirData);
      setHash(result.hash);
      alert(`Uploaded! Hash: ${result.hash}`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed!');
    }
  };

  // Fetch from IPFS
  const handleFetch = async () => {
    if (!hash) return;

    try {
      const fhirData = await fetchFromIPFS(hash);
      setData(fhirData);
      console.log('Fetched data:', fhirData);
    } catch (error) {
      console.error('Fetch failed:', error);
      alert('Fetch failed!');
    }
  };

  return (
    <div>
      <button onClick={handleUpload}>Upload to IPFS</button>
      {hash && (
        <>
          <p>Hash: {hash}</p>
          <button onClick={handleFetch}>Fetch from IPFS</button>
        </>
      )}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

## Pinata Dashboard Features

Access your dashboard at https://app.pinata.cloud

### Files View
- See all uploaded files
- View CIDs and sizes
- Download or delete files
- Check pin status

### Gateways
- Default: `gateway.pinata.cloud`
- Dedicated gateways available (paid plans)
- Custom domain support

### Analytics
- Bandwidth usage
- Request counts
- Storage metrics

## Pricing

**Free Tier** (Perfect for development):
- 1 GB storage
- 100 GB bandwidth/month
- Unlimited pins
- Standard gateway

**Picnic Plan** ($20/month):
- 50 GB storage
- 500 GB bandwidth
- Dedicated gateway
- Priority support

## Troubleshooting

### "Authentication failed"
- Check your JWT token is correct
- Ensure `.env.local` has `NEXT_PUBLIC_PINATA_JWT`
- Restart your dev server after adding env vars

### "Upload failed"
- Check you haven't exceeded free tier limits
- Verify API key has correct permissions
- Check network connectivity

### "Fetch failed"
- Wait a few seconds (IPFS propagation delay)
- Try again - first fetch may be slow
- Check CID is correct

### Development Mode
If no API key is configured, the system uses mock hashes for testing:
```
Mock hash: QmX7k2m9p8n4b5c6d7e8f9g0h1i2j3k4l5m6n
```

## Security Best Practices

✅ **Never commit `.env.local`** (already in `.gitignore`)  
✅ **Use environment variables** for API keys  
✅ **Encrypt sensitive FHIR data** before upload  
✅ **Rotate API keys** periodically  
✅ **Use dedicated keys** per environment (dev/prod)  

## Next Steps

1. ✅ Create Pinata account
2. ✅ Get JWT token
3. ✅ Add to `.env.local`
4. ⏳ Test upload with sample FHIR data
5. ⏳ Integrate with upload page
6. ⏳ Add encryption before upload
7. ⏳ Display records from IPFS

## Resources

- Pinata Dashboard: https://app.pinata.cloud
- Pinata Docs: https://docs.pinata.cloud
- IPFS Docs: https://docs.ipfs.tech
- CID Inspector: https://cid.ipfs.tech
