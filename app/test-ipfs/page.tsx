'use client';

import { useState } from 'react';
import { uploadToIPFS, fetchFromIPFS } from '@/lib/ipfs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function TestIPFS() {
  const [testData, setTestData] = useState(JSON.stringify({
    resourceType: "Patient",
    id: "test-123",
    name: [{ text: "Test Patient" }],
    birthDate: "1990-01-01"
  }, null, 2));
  
  const [ipfsHash, setIpfsHash] = useState('');
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [retrievedData, setRetrievedData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = JSON.parse(testData);
      console.log('Uploading to IPFS via Pinata...');
      
      const result = await uploadToIPFS(data);
      
      console.log('Upload successful!');
      console.log('IPFS Hash (CID):', result.hash);
      console.log('IPFS URL:', result.url);
      console.log('Size:', result.size, 'bytes');
      
      setIpfsHash(result.hash);
      setIpfsUrl(result.url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    if (!ipfsHash) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching from IPFS:', ipfsHash);
      const data = await fetchFromIPFS(ipfsHash);
      
      console.log('Fetch successful!');
      setRetrievedData(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Test Pinata IPFS Integration</h1>
        
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>1. Upload FHIR JSON to IPFS</CardTitle>
            <CardDescription>
              Test uploading JSON data to Pinata IPFS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <Button onClick={handleUpload} disabled={loading}>
              {loading ? 'Uploading...' : 'Upload to IPFS'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {ipfsHash && (
          <Card>
            <CardHeader>
              <CardTitle>2. Upload Results</CardTitle>
              <CardDescription>
                Your data has been uploaded to IPFS via Pinata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">IPFS Hash (CID):</p>
                <code className="block p-3 bg-muted rounded-lg text-sm break-all">
                  {ipfsHash}
                </code>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">IPFS URL:</p>
                <a 
                  href={ipfsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 bg-muted rounded-lg text-sm text-blue-600 hover:underline break-all"
                >
                  {ipfsUrl}
                </a>
              </div>

              <Button onClick={handleFetch} disabled={loading}>
                {loading ? 'Fetching...' : 'Fetch from IPFS'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Retrieved Data Section */}
        {retrievedData && (
          <Card>
            <CardHeader>
              <CardTitle>3. Retrieved Data</CardTitle>
              <CardDescription>
                Data fetched from IPFS successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto">
                {retrievedData}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Step 1:</strong> Click &ldquo;Upload to IPFS&rdquo; - Your JSON data is sent to Pinata</p>
            <p><strong>Step 2:</strong> Pinata pins it to IPFS network and returns a CID (hash)</p>
            <p><strong>Step 3:</strong> Click &ldquo;Fetch from IPFS&rdquo; - Data is retrieved using the CID</p>
            <p><strong>Step 4:</strong> Verify the retrieved data matches the original</p>
            <p className="pt-4 text-muted-foreground">
              <strong>Note:</strong> First fetch may take 5-10 seconds for IPFS propagation. Subsequent fetches are instant.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
