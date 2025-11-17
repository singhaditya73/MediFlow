/**
 * IPFS Storage Service
 * Upload FHIR JSON to IPFS and retrieve by hash
 */

export interface IPFSUploadResult {
  hash: string;
  size: number;
  url: string;
}

/**
 * Upload FHIR JSON to IPFS using Pinata
 * Pinata provides reliable IPFS pinning with dedicated gateways
 */
export async function uploadToIPFS(fhirData: unknown): Promise<IPFSUploadResult> {
  try {
    const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

    // Method 1: Upload JSON directly to Pinata (Recommended)
    if (PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY)) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Use JWT if available, otherwise use API key/secret
      if (PINATA_JWT) {
        headers['Authorization'] = `Bearer ${PINATA_JWT}`;
      } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
        headers['pinata_api_key'] = PINATA_API_KEY;
        headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
      }

      const body = JSON.stringify({
        pinataContent: fhirData,
        pinataMetadata: {
          name: `FHIR-Record-${Date.now()}.json`,
          keyvalues: {
            type: 'fhir',
            timestamp: new Date().toISOString(),
          },
        },
        pinataOptions: {
          cidVersion: 1, // Use CIDv1 for better compatibility
        },
      });

      // Add timeout for upload (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers,
          body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Pinata upload failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
        }
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        const error = fetchError as { name?: string; message?: string };
        if (error.name === 'AbortError') {
          throw new Error('IPFS upload timed out after 30 seconds. Please check your connection and try again.');
        }
        throw fetchError;
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Pinata upload failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const hash = data.IpfsHash; // This is the CID

      return {
        hash,
        size: JSON.stringify(fhirData).length,
        url: `https://gateway.pinata.cloud/ipfs/${hash}`,
      };
    }

    // Fallback: Development mode with mock hash
    console.warn('No Pinata credentials found. Using mock IPFS hash for development.');
    console.log('To use Pinata, add NEXT_PUBLIC_PINATA_JWT to your .env.local file');
    
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      hash: mockHash,
      size: JSON.stringify(fhirData).length,
      url: `https://ipfs.io/ipfs/${mockHash}`,
    };

  } catch (error) {
    console.error('IPFS upload error:', error);
    
    // Check if it's a network error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('timed out') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
      throw new Error(
        '❌ IPFS upload failed due to network issues.\n\n' +
        'Please check your internet connection and try again.\n' +
        'If the problem persists, Pinata service may be temporarily unavailable.'
      );
    }
    
    // For other errors in production, throw them
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`IPFS upload failed: ${errorMessage}`);
    }
    
    // Development fallback: Create mock hash
    console.warn('⚠️ Using mock IPFS hash for development:', errorMessage);
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      hash: mockHash,
      size: JSON.stringify(fhirData).length,
      url: `https://ipfs.io/ipfs/${mockHash}`,
    };
  }
}

/**
 * Retrieve FHIR JSON from IPFS by hash (CID)
 * Uses multiple gateways for redundancy
 */
export async function fetchFromIPFS(hash: string): Promise<unknown> {
  try {
    const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
    
    // Try multiple IPFS gateways for redundancy
    const gateways = [
      `https://${PINATA_GATEWAY}/ipfs/${hash}`, // Pinata dedicated gateway (fastest)
      `https://ipfs.io/ipfs/${hash}`, // Public IPFS gateway
      `https://cloudflare-ipfs.com/ipfs/${hash}`, // Cloudflare gateway
      `https://${hash}.ipfs.dweb.link/`, // dweb.link gateway
    ];

    for (const url of gateways) {
      try {
        console.log(`Fetching from: ${url}`);
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-cache', // Always get fresh data
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched from: ${url}`);
          return data;
        }
      } catch (err) {
        console.warn(`Failed to fetch from ${url}:`, err);
        continue;
      }
    }

    throw new Error('Failed to fetch from all IPFS gateways');
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw error;
  }
}

/**
 * Pin content to IPFS using Pinata (keep it available permanently)
 * Content uploaded via pinJSONToIPFS is already pinned automatically
 */
export async function pinToIPFS(hash: string): Promise<boolean> {
  try {
    const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

    if (!PINATA_JWT && !(PINATA_API_KEY && PINATA_SECRET_KEY)) {
      console.warn('No Pinata credentials, skipping pin');
      return false;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        hashToPin: hash,
        pinataMetadata: {
          name: `Pinned-${hash}`,
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('IPFS pin error:', error);
    return false;
  }
}

/**
 * List all pinned files from Pinata
 */
export async function listPinnedFiles(): Promise<unknown[]> {
  try {
    const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

    if (!PINATA_JWT) {
      console.warn('No Pinata JWT configured');
      return [];
    }

    const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list pins: ${response.statusText}`);
    }

    const data = await response.json();
    return data.rows || [];
  } catch (error) {
    console.error('List pins error:', error);
    return [];
  }
}

/**
 * Unpin content from Pinata (remove from permanent storage)
 */
export async function unpinFromIPFS(hash: string): Promise<boolean> {
  try {
    const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

    if (!PINATA_JWT) {
      console.warn('No Pinata JWT configured');
      return false;
    }

    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Unpin error:', error);
    return false;
  }
}

/**
 * Check if content is available on IPFS
 */
export async function checkIPFSAvailability(hash: string): Promise<boolean> {
  try {
    const response = await fetch(`https://ipfs.io/ipfs/${hash}`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}
