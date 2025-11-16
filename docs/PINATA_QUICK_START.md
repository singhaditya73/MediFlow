# IPFS with Pinata - Quick Reference

## ✅ Yes! Pinata is Perfect for FHIR Storage

**Why Pinata for FHIR JSON:**
- ✅ **Always returns CID (hash)** - Every upload gives you a unique identifier
- ✅ **Automatic pinning** - Content stays available permanently  
- ✅ **Fast dedicated gateways** - Quick retrieval
- ✅ **JSON-native API** - Upload JSON directly (no need to create files)
- ✅ **Free tier** - 1GB storage + 100GB bandwidth
- ✅ **Metadata support** - Tag and organize your records
- ✅ **Reliable** - Used by major NFT platforms and dApps

## Setup (2 minutes)

1. **Get Pinata JWT:**
   ```
   https://app.pinata.cloud/keys → New Key → Copy JWT
   ```

2. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_jwt_here
   ```

3. **Done!** The code will automatically use Pinata.

## Usage

### Upload FHIR JSON
```typescript
import { uploadToIPFS } from '@/lib/ipfs';

const fhirData = {
  resourceType: "Patient",
  name: [{ text: "John Doe" }],
  // ... rest of FHIR data
};

const result = await uploadToIPFS(fhirData);
// Returns: { hash: "QmYwAPJ...", size: 2048, url: "https://gateway.pinata.cloud/ipfs/..." }
```

### Retrieve FHIR JSON
```typescript
import { fetchFromIPFS } from '@/lib/ipfs';

const fhirData = await fetchFromIPFS("QmYwAPJ...");
// Returns: Original FHIR JSON object
```

### Full Upload Flow
```typescript
import { uploadHealthRecord } from '@/lib/uploadFlow';

const result = await uploadHealthRecord(
  "Patient has diabetes...", // clinical text
  "John Doe",                // patient name
  "0x123..."                 // wallet address
);

// Automatically:
// 1. Converts text to FHIR
// 2. Uploads to IPFS via Pinata → Get CID
// 3. Registers CID on blockchain
// 4. Logs audit trail
// 5. Saves to localStorage
```

## What You Get

**Every upload returns:**
```typescript
{
  hash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",  // IPFS CID
  size: 2048,                                               // Size in bytes
  url: "https://gateway.pinata.cloud/ipfs/QmYwAPJ..."      // Direct access URL
}
```

**The CID (hash) is:**
- ✅ Unique identifier for your content
- ✅ Cryptographically secure
- ✅ Content-addressed (same content = same CID)
- ✅ Permanently linked to that exact data
- ✅ Can be stored on blockchain

## Pinata API Endpoints Used

1. **Upload JSON:** `POST https://api.pinata.cloud/pinning/pinJSONToIPFS`
   - Directly upload JSON object
   - Automatic pinning
   - Returns CID immediately

2. **Pin by Hash:** `POST https://api.pinata.cloud/pinning/pinByHash`
   - Pin existing IPFS content
   - Ensure permanent availability

3. **List Pins:** `GET https://api.pinata.cloud/data/pinList`
   - View all your pinned files
   - Check status and metadata

4. **Unpin:** `DELETE https://api.pinata.cloud/pinning/unpin/{CID}`
   - Remove from permanent storage

## Gateways

**Pinata Gateway (Primary):**
```
https://gateway.pinata.cloud/ipfs/QmYwAPJ...
```

**Fallback Gateways:**
```
https://ipfs.io/ipfs/QmYwAPJ...
https://cloudflare-ipfs.com/ipfs/QmYwAPJ...
https://QmYwAPJ....ipfs.dweb.link/
```

## Cost

**Free Tier:**
- 1 GB storage
- 100 GB bandwidth/month
- Unlimited pins
- Perfect for development & small projects

**Paid Plans:** Start at $20/month
- More storage & bandwidth
- Dedicated gateways
- Custom domains

## Development Mode

**No API key?** No problem!
- System automatically uses mock CIDs for testing
- Perfect for local development
- Add real Pinata JWT when ready for production

## Complete Flow Diagram

```
User Input (Clinical Text)
    ↓
[convertTextToFhir] → FHIR JSON
    ↓
[uploadToIPFS] → POST to Pinata API
    ↓
Pinata stores & pins to IPFS network
    ↓
Returns CID: "QmYwAPJ..."
    ↓
[registerRecord] → Store CID on blockchain
    ↓
[logAudit] → Record upload event
    ↓
[localStorage] → Save for quick access
    ↓
User can view/share via CID
```

## Best Practices

✅ **Upload FHIR JSON directly** (not as files)  
✅ **Store CID on blockchain** (immutable reference)  
✅ **Use metadata** for organization  
✅ **Encrypt sensitive data** before upload  
✅ **Pin important content** to ensure availability  
✅ **Use dedicated gateway** for production (paid plans)  

## Troubleshooting

**"Upload failed":**
- Check JWT in `.env.local`
- Restart dev server after adding env vars
- Check Pinata dashboard for API limits

**"Fetch slow":**
- First fetch may take 5-10 seconds (IPFS propagation)
- Subsequent fetches are fast (cached)
- Use Pinata gateway for fastest access

**Development mode:**
- If no JWT, system uses mock CIDs starting with "Qm..."
- Perfect for testing without API key
- Add real JWT when ready for production

## Resources

- **Setup Guide:** `docs/PINATA_SETUP.md`
- **Full Guide:** `docs/IPFS_UPLOAD_GUIDE.md`
- **Pinata Dashboard:** https://app.pinata.cloud
- **Get JWT:** https://app.pinata.cloud/keys

## Quick Test

```bash
# 1. Add JWT to .env.local
echo 'NEXT_PUBLIC_PINATA_JWT=your_jwt_here' >> .env.local

# 2. Restart dev server
npm run dev

# 3. Test upload (in your app)
const result = await uploadToIPFS({ test: "Hello IPFS!" });
console.log(result.hash); // QmYwAPJ...

# 4. Verify in Pinata dashboard
# Go to: https://app.pinata.cloud/pinmanager
```

**That's it!** Pinata handles all the IPFS complexity for you. 🎉
