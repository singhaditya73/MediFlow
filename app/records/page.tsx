'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, ExternalLink, Upload, Search, Share2, Users, Send, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ShareRecordModal } from '@/components/share-record-modal';
import { CountdownTimer } from '@/components/countdown-timer';
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

interface SharedRecord extends FhirRecord {
  sharedBy?: string;
  accessLevel?: string;
  expiresAt?: string | null;
}

interface SharedByMe {
  recordId: string;
  fileName: string;
  ipfsHash: string;
  resourceType: string;
  recipientWallet: string;
  accessLevel: string;
  expiresAt: number | null;
  sharedAt: string;
  transactionHash: string;
}

export default function RecordsPage() {
  return (
    <ProtectedRoute>
      <RecordsPageContent />
    </ProtectedRoute>
  );
}

function RecordsPageContent() {
  const [records, setRecords] = useState<FhirRecord[]>([]);
  const [sharedRecords, setSharedRecords] = useState<SharedRecord[]>([]);
  const [sharedByMe, setSharedByMe] = useState<SharedByMe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FhirRecord | null>(null);
  const [activeTab, setActiveTab] = useState('my-records');
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
          try {
            const parsedRecords = JSON.parse(savedRecords);
            setRecords(parsedRecords);
          } catch (parseError) {
            console.error('Failed to parse records:', parseError);
            // Clear corrupted data
            localStorage.removeItem(`records_${walletAddress}`);
            setRecords([]);
          }
        }

        // Load records shared with this user
        console.log('Loading shared records for wallet:', walletAddress);
        const savedSharedRecords = localStorage.getItem(`received_${walletAddress}`);
        console.log('Saved shared records:', savedSharedRecords);
        if (savedSharedRecords) {
          let parsedShared;
          try {
            parsedShared = JSON.parse(savedSharedRecords);
          } catch (parseError) {
            console.error('Failed to parse shared records:', parseError);
            localStorage.removeItem(`received_${walletAddress}`);
            setSharedRecords([]);
            parsedShared = [];
          }
          console.log('Parsed shared records:', parsedShared);
          
          // Filter out expired records
          const now = Date.now();
          const activeShared = parsedShared.filter((record: SharedRecord) => {
            if (!record.expiresAt) return true; // Never expires
            const expiryTime = typeof record.expiresAt === 'number' 
              ? record.expiresAt * 1000 
              : new Date(record.expiresAt).getTime();
            return expiryTime > now;
          });
          
          // Update localStorage if any were removed
          if (activeShared.length !== parsedShared.length) {
            console.log('Removed expired records from shared with me');
            localStorage.setItem(`received_${walletAddress}`, JSON.stringify(activeShared));
          }
          
          setSharedRecords(activeShared);
        }

        // Load records shared by this user
        const savedSharedByMe = localStorage.getItem(`shared_by_${walletAddress}`);
        console.log('Saved shared by me:', savedSharedByMe);
        if (savedSharedByMe) {
          const parsedSharedByMe = JSON.parse(savedSharedByMe);
          console.log('Parsed shared by me:', parsedSharedByMe);
          
          // Filter out expired records
          const now = Date.now();
          const activeSharedByMe = parsedSharedByMe.filter((record: SharedByMe) => {
            if (!record.expiresAt) return true; // Never expires
            const expiryTime = typeof record.expiresAt === 'number' 
              ? record.expiresAt * 1000 
              : new Date(record.expiresAt).getTime();
            return expiryTime > now;
          });
          
          // Update localStorage if any were removed
          if (activeSharedByMe.length !== parsedSharedByMe.length) {
            console.log('Removed expired records from shared by me');
            localStorage.setItem(`shared_by_${walletAddress}`, JSON.stringify(activeSharedByMe));
          }
          
          setSharedByMe(activeSharedByMe);
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

  const filteredSharedRecords = sharedRecords.filter(record =>
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
        try {
          fhirData = await fetchFromIPFS(record.ipfsHash);
        } catch (ipfsError) {
          console.error('IPFS fetch error:', ipfsError);
          alert(
            '❌ Failed to fetch record from IPFS.\n\n' +
            'Possible reasons:\n' +
            '• IPFS gateway is temporarily unavailable\n' +
            '• The content may not be pinned anymore\n' +
            '• Network connection issues\n\n' +
            'Please try again later or contact support.'
          );
          return;
        }
      }

      if (!fhirData) {
        alert('❌ No data available for this record');
        return;
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
      alert('❌ Failed to download record. Please try again.');
    }
  };

  const handleViewOnIPFS = (record: FhirRecord) => {
    const gateway = record.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`;
    window.open(gateway, '_blank');
  };

  const handleShare = (record: FhirRecord) => {
    setSelectedRecord(record);
    setShareModalOpen(true);
  };

  const handleRefresh = () => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) return;

    console.log('Manual refresh triggered');
    
    // Reload all records
    const savedRecords = localStorage.getItem(`records_${walletAddress}`);
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    
    const savedSharedRecords = localStorage.getItem(`received_${walletAddress}`);
    if (savedSharedRecords) {
      setSharedRecords(JSON.parse(savedSharedRecords));
    }
    
    const savedSharedByMe = localStorage.getItem(`shared_by_${walletAddress}`);
    if (savedSharedByMe) {
      setSharedByMe(JSON.parse(savedSharedByMe));
    }
    
    console.log('Records refreshed');
  };

  const handleExpiredRecord = (recordId: string, isReceived: boolean) => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) return;

    console.log('Removing expired record:', recordId);

    if (isReceived) {
      // Remove from "Shared With Me"
      const updatedShared = sharedRecords.filter(r => r.id !== recordId);
      setSharedRecords(updatedShared);
      localStorage.setItem(`received_${walletAddress}`, JSON.stringify(updatedShared));
    } else {
      // Remove from "Shared By Me"
      const updatedSharedByMe = sharedByMe.filter(r => r.recordId !== recordId);
      setSharedByMe(updatedSharedByMe);
      localStorage.setItem(`shared_by_${walletAddress}`, JSON.stringify(updatedSharedByMe));
    }
  };

  const handleShareSuccess = () => {
    // Reload all records after sharing
    const walletAddress = localStorage.getItem('walletAddress');
    if (walletAddress) {
      console.log('Refreshing records after share...');
      
      // Reload shared by me
      const savedSharedByMe = localStorage.getItem(`shared_by_${walletAddress}`);
      if (savedSharedByMe) {
        const parsedSharedByMe = JSON.parse(savedSharedByMe);
        console.log('Refreshed shared by me:', parsedSharedByMe);
        setSharedByMe(parsedSharedByMe);
      }
      
      // Reload shared with me (in case you shared with yourself)
      const savedSharedRecords = localStorage.getItem(`received_${walletAddress}`);
      if (savedSharedRecords) {
        const parsedShared = JSON.parse(savedSharedRecords);
        console.log('Refreshed shared with me:', parsedShared);
        setSharedRecords(parsedShared);
      }
    }
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Health Records</h1>
            <p className="text-muted-foreground">
              Your FHIR records stored on IPFS - fully decentralized and secure
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="my-records" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My Records ({records.length})
            </TabsTrigger>
            <TabsTrigger value="shared-with-me" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Shared With Me ({sharedRecords.length})
            </TabsTrigger>
            <TabsTrigger value="shared-by-me" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Shared By Me ({sharedByMe.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-records">
            {renderMyRecords()}
          </TabsContent>

          <TabsContent value="shared-with-me">
            {renderSharedRecords()}
          </TabsContent>

          <TabsContent value="shared-by-me">
            {renderSharedByMe()}
          </TabsContent>
        </Tabs>

        {/* Share Modal */}
        {selectedRecord && (
          <ShareRecordModal
            isOpen={shareModalOpen}
            onClose={() => {
              setShareModalOpen(false);
              setSelectedRecord(null);
            }}
            onSuccess={handleShareSuccess}
            record={selectedRecord}
          />
        )}
      </div>
    </div>
  );

  function renderMyRecords() {
    if (records.length === 0) {
      return renderEmptyState();
    }

    return (
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
        {renderRecordGrid(filteredRecords, true)}

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No records match your search.</p>
          </div>
        )}
      </>
    );
  }

  function renderSharedRecords() {
    if (sharedRecords.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mb-6">
            <Users className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">No Shared Records</h2>
          <p className="text-muted-foreground text-center max-w-md">
            No one has shared any health records with you yet. When someone grants you access to their records, they will appear here.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search shared records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Shared Records Grid */}
        {renderRecordGrid(filteredSharedRecords, false)}

        {filteredSharedRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No shared records match your search.</p>
          </div>
        )}
      </>
    );
  }

  function renderRecordGrid(recordsList: (FhirRecord | SharedRecord)[], showShareButton: boolean) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recordsList.map((record, index) => {
          const sharedRecord = record as SharedRecord;
          // Create unique key combining record id with index and shared info to avoid duplicates
          const uniqueKey = sharedRecord.sharedBy 
            ? `${record.id}-shared-${sharedRecord.sharedBy}-${index}`
            : `${record.id}-${index}`;
          return (
            <Card key={uniqueKey} className="p-6 hover:shadow-lg transition-shadow">
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
                {sharedRecord.sharedBy && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Shared by:</span>
                    <span className="font-mono text-xs truncate">
                      {sharedRecord.sharedBy.slice(0, 6)}...{sharedRecord.sharedBy.slice(-4)}
                    </span>
                  </div>
                )}
                {sharedRecord.accessLevel && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Access:</span>
                    <span className="capitalize">{sharedRecord.accessLevel}</span>
                  </div>
                )}
                {sharedRecord.expiresAt && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Expires in:</span>
                    <CountdownTimer 
                      expiresAt={sharedRecord.expiresAt} 
                      onExpire={() => handleExpiredRecord(record.id, true)}
                    />
                  </div>
                )}
                {!sharedRecord.expiresAt && sharedRecord.sharedBy && (
                  <div className="flex items-center gap-2">
                    <CountdownTimer expiresAt={null} />
                  </div>
                )}
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
                <div className="flex items-center gap-2">
                  <span className="font-medium">Created:</span>
                  <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                {showShareButton && (
                  <Button
                    size="sm"
                    onClick={() => handleShare(record)}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Record
                  </Button>
                )}
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
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  function renderSharedByMe() {
    if (sharedByMe.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 flex items-center justify-center mb-6">
            <Send className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">No Shared Records</h2>
          <p className="text-muted-foreground text-center max-w-md">
            You haven&apos;t shared any records yet. Share your health records securely using blockchain-verified access control.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search shared records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Shared By Me Table/Cards */}
        <div className="space-y-4">
          {sharedByMe
            .filter(item =>
              item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.recipientWallet.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item, index) => (
              <Card key={`shared-by-${item.recordId}-${item.recipientWallet}-${index}`} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">{item.fileName}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Shared with:</span>
                          <span className="font-mono text-xs truncate">
                            {item.recipientWallet.slice(0, 10)}...{item.recipientWallet.slice(-8)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Access Level:</span>
                          <span className="capitalize">{item.accessLevel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Shared on:</span>
                          <span>{new Date(item.sharedAt).toLocaleString()}</span>
                        </div>
                        {item.expiresAt ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Expires in:</span>
                            <CountdownTimer 
                              expiresAt={item.expiresAt} 
                              onExpire={() => handleExpiredRecord(item.recordId, false)}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Expires:</span>
                            <CountdownTimer expiresAt={null} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:w-48">
                    <div className="text-xs text-muted-foreground">
                      <div className="font-medium mb-1">IPFS Hash</div>
                      <div className="font-mono truncate">{item.ipfsHash.slice(0, 12)}...</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="font-medium mb-1">Transaction</div>
                      <div className="font-mono truncate">{item.transactionHash.slice(0, 12)}...</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {sharedByMe.filter(item =>
          item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.recipientWallet.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No shared records match your search.</p>
          </div>
        )}
      </>
    );
  }

  function renderEmptyState() {
    return (
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
    );
  }
}
