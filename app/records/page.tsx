'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink, Upload, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fetchFromIPFS } from '@/lib/ipfs';

interface FhirRecord {
  id: string;
  fileName: string;
  resourceType: string;
  ipfsHash: string;
  createdAt: string;
  fileSize?: string | number;
  ipfsUrl?: string;
  fhirData?: unknown;
  transactionHash?: string;
  blockNumber?: number;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<FhirRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      router.replace('/signup');
      return;
    }

    // Load records from localStorage
    const loadRecords = () => {
      try {
        const savedRecords = localStorage.getItem(`records_${walletAddress}`);
        if (savedRecords) {
          const parsedRecords = JSON.parse(savedRecords);
          setRecords(parsedRecords);
        }
      } catch (error) {
        console.error('Failed to load records:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [router]);

  const filteredRecords = records.filter(record =>
    record.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.resourceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (record: FhirRecord) => {
    try {
      // If we have cached FHIR data, use it
      let fhirData = record.fhirData;
      
      // Otherwise fetch from IPFS
      if (!fhirData) {
        console.log('Fetching from IPFS:', record.ipfsHash);
        fhirData = await fetchFromIPFS(record.ipfsHash);
      }

      // Create download
      const jsonString = JSON.stringify(fhirData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record.fileName.replace(/\.[^/.]+$/, '')}-fhir.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download record from IPFS');
    }
  };

  const handleViewOnIPFS = (record: FhirRecord) => {
    const gateway = record.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`;
    window.open(gateway, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10">
      <div className="container px-4 py-8 mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Health Records</h1>
          <p className="text-muted-foreground">
            All your FHIR records stored on IPFS - fully decentralized and secure
          </p>
        </div>

        {records.length > 0 ? (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search records by name or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Records Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {record.resourceType}
                    </span>
                  </div>

                  <h3 className="font-semibold mb-2 truncate">{record.fileName}</h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">IPFS:</span>
                      <span className="font-mono text-xs truncate">
                        {record.ipfsHash.slice(0, 8)}...{record.ipfsHash.slice(-6)}
                      </span>
                    </div>
                    {record.transactionHash && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Blockchain:</span>
                        <span className="font-mono text-xs truncate">
                          {record.transactionHash.slice(0, 8)}...{record.transactionHash.slice(-6)}
                        </span>
                      </div>
                    )}
                    {record.fileSize && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Size:</span>
                        <span>
                          {typeof record.fileSize === 'number' 
                            ? `${(record.fileSize / 1024).toFixed(2)} KB` 
                            : record.fileSize}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Created:</span>
                      <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(record)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewOnIPFS(record)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No records match your search.</p>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-teal-600 dark:text-teal-400" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">No Records Yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              You haven&apos;t uploaded any health records yet. Start by converting your medical documents to FHIR format and storing them on IPFS.
            </p>
            
            <Button
              size="lg"
              onClick={() => router.push('/upload')}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Your First Record
            </Button>

            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-2xl">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🔒 Your Records, Your Control
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>✓ Stored on IPFS - Decentralized and permanent</li>
                <li>✓ Controlled by blockchain smart contracts</li>
                <li>✓ Only you can grant access to others</li>
                <li>✓ Immutable audit trail of all access</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
