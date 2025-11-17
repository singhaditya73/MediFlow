"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, User, Eye } from "lucide-react"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { getAuditTrail } from "@/lib/blockchain"
import { getCurrentAccount, isMetaMaskInstalled } from "@/lib/wallet"

interface AuditEntry {
  recordId: string
  user: string
  action: string
  timestamp: number
  metadata: string
  previousHash: string
}

// AccessDetails interface - for future implementation
/*
interface AccessDetails {
  granter: string
  level: number
  expiresAt: bigint
  isActive: boolean
  grantedAt: bigint
}
*/

export default function AuditTrailPage() {
  return (
    <ProtectedRoute>
      <AuditTrailPageContent />
    </ProtectedRoute>
  )
}

function AuditTrailPageContent() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  // const [accessDetails, setAccessDetails] = useState<AccessDetails | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recordId] = useState("default-record-id")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!isMetaMaskInstalled()) {
          setError("⚠️ MetaMask not detected. Please install MetaMask to view audit trails.");
          setLoading(false);
          return;
        }
        
        let account;
        try {
          account = await getCurrentAccount();
        } catch (accountError) {
          console.error("Failed to get account:", accountError);
          setError("❌ Failed to connect to wallet. Please unlock MetaMask and refresh the page.");
          setLoading(false);
          return;
        }
        
        setWalletAddress(account);
        
        if (account) {
          // Load audit trail with error handling
          try {
            const trail = await getAuditTrail(recordId);
            setAuditEntries(trail);
          } catch (trailError) {
            console.error("Failed to load audit trail:", trailError);
            setError("⚠️ Failed to load audit trail from blockchain. The smart contract may not be deployed or accessible.");
            // Don't return, try to load access details anyway
          }

          // Load access details for test address
          // Note: getAccessDetails function needs to be implemented in blockchain.ts
          /*
          try {
            const testAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
            const details = await getAccessDetails(recordId, testAddress);
            if (details && details.granter !== "0x0000000000000000000000000000000000000000") {
              setAccessDetails(details);
            }
          } catch (detailsError) {
            console.warn("Failed to load access details:", detailsError);
            // Non-critical, don't set error
          }
          */
        }
      } catch (error) {
        console.error("Error loading data:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(`❌ Failed to load audit data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
    loadData()
  }, [recordId])

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Unused helper functions - commented out until access details feature is implemented
  /*
  const getAccessLevelName = (level: number) => {
    const levels = ["None", "Read", "Write", "Full"]
    return levels[level] || "Unknown"
  }

  const isExpired = (expiresAt: bigint) => {
    if (expiresAt === BigInt(0)) return false
    return Date.now() / 1000 > Number(expiresAt)
  }

  const timeUntilExpiry = (expiresAt: bigint) => {
    if (expiresAt === BigInt(0)) return "Never expires"
    
    const now = Math.floor(Date.now() / 1000)
    const expiry = Number(expiresAt)
    
    if (expiry <= now) return "Expired"
    
    const diff = expiry - now
    const days = Math.floor(diff / (24 * 60 * 60))
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((diff % (60 * 60)) / 60)
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }
  */

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10">
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-5"></div>
      <div className="container px-4 py-6 mx-auto relative z-10">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">MediFlow</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" className="hidden md:flex">
              {walletAddress ? formatAddress(walletAddress) : "Sign In"}
            </Button>
          </div>
        </header>

        <main className="py-12 max-w-6xl mx-auto">
          <Link href="/access-control" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Access Control
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Audit Trail & Access Status</h1>
            <p className="text-muted-foreground">
              View immutable blockchain records of all access activities and time-limited permissions
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Access Status Card - Temporarily disabled until getAccessDetails is implemented */}
          {/*
          {accessDetails && (
            <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden mb-8">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground">Active Access Permissions</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Current access status and time-limited permissions
                    </CardDescription>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400/20 to-green-600/20 dark:from-green-400/10 dark:to-green-600/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Access Level</div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{getAccessLevelName(accessDetails.level)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Status</div>
                      <div className="flex items-center gap-2">
                        {accessDetails.isActive && !isExpired(accessDetails.expiresAt) ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="font-medium text-red-600 dark:text-red-400">Expired/Inactive</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Granted By</div>
                      <div className="font-mono text-sm">{formatAddress(accessDetails.granter)}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Time Remaining</div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{timeUntilExpiry(accessDetails.expiresAt)}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Granted On</div>
                      <div className="text-sm">{formatTimestamp(Number(accessDetails.grantedAt))}</div>
                    </div>

                    {accessDetails.expiresAt > BigInt(0) && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Expires On</div>
                        <div className="text-sm">{formatTimestamp(Number(accessDetails.expiresAt))}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          */}

          {/* Audit Trail Card */}
          <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-foreground">Immutable Audit Trail</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Blockchain-verified record of all access events (cannot be modified or deleted)
                  </CardDescription>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400/20 to-purple-600/20 dark:from-purple-400/10 dark:to-purple-600/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading audit trail...
                </div>
              ) : auditEntries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No audit entries yet. Grant access to create the first entry.
                </div>
              ) : (
                <div className="space-y-4">
                  {auditEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{entry.action.replace(/_/g, " ").toUpperCase()}</div>
                            <div className="text-sm text-muted-foreground">
                              by {formatAddress(entry.user)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {formatTimestamp(entry.timestamp)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Block #{index + 1}
                          </div>
                        </div>
                      </div>

                      {entry.metadata && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-1">Metadata:</div>
                          <div className="text-xs font-mono bg-muted/30 p-2 rounded">
                            {entry.metadata}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Previous Hash: <span className="font-mono">{entry.previousHash.slice(0, 20)}...</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground mb-1">Blockchain Security</h3>
                <p className="text-sm text-muted-foreground">
                  All entries are stored on the blockchain with cryptographic hashing. Each entry links to the previous one,
                  creating an immutable chain. Any tampering attempt will be immediately detected through hash verification.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
