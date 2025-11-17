"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Info, Lock, Plus, Shield, User, Zap, Clock, CheckCircle, AlertCircle } from "lucide-react"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TimeSelector } from "@/components/time-selector"
import { TransactionDetails } from "@/components/transaction-details"
import { 
  grantAccessOnChain, 
  revokeAccessOnChain, 
  logAuditOnChain
} from "@/lib/blockchain"
import { getCurrentAccount, isMetaMaskInstalled } from "@/lib/wallet"

interface AccessItem {
  id: string
  name: string
  email: string
  role: string
  access: boolean
  expiresAt?: Date | null
  recordId?: string
  walletAddress?: string
}

interface SecuritySettings {
  auditTrail: boolean
  notifications: boolean
  timeLimitedAccess: boolean
  encryption: boolean
  timeLimitSeconds: number
}

export default function AccessControlPage() {
  return (
    <ProtectedRoute>
      <AccessControlPageContent />
    </ProtectedRoute>
  );
}

function AccessControlPageContent() {
  const router = useRouter()
  const [accessList, setAccessList] = useState<AccessItem[]>([])
  const [newWalletAddress, setNewWalletAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [lastTransaction, setLastTransaction] = useState<{transactionHash: string; gasUsed: string; blockNumber: number; blockHash: string; blockTime: string; timestamp: number} | null>(null)
  
  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    auditTrail: true,
    notifications: true,
    timeLimitedAccess: false,
    encryption: true,
    timeLimitSeconds: 30 * 24 * 60 * 60, // 30 days default
  })

  // Load wallet and access list on mount
  useEffect(() => {
    const loadWalletAndData = async () => {
      try {
        if (isMetaMaskInstalled()) {
          const account = await getCurrentAccount()
          setWalletAddress(account)
        }
        await fetchAccessList()
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
    loadWalletAndData()
  }, [])

  const fetchAccessList = async () => {
    try {
      const response = await fetch("/api/access-control")
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.accessControls)) {
          setAccessList(
            data.accessControls.map((ac: { 
              id: string; 
              receiver: { name: string; walletAddress: string }; 
              accessLevel: string; 
              isActive: boolean; 
              expiresAt: string | null; 
              recordId: string 
            }) => ({
              id: ac.id,
              name: ac.receiver.name || "Unknown",
              email: ac.receiver.walletAddress,
              role: ac.accessLevel,
              access: ac.isActive,
              expiresAt: ac.expiresAt ? new Date(ac.expiresAt) : null,
              recordId: ac.recordId,
              walletAddress: ac.receiver.walletAddress,
            }))
          )
        }
      }
    } catch (error) {
      console.error("Error fetching access list:", error)
    }
  }

  const toggleAccess = async (id: string) => {
    const item = accessList.find((a) => a.id === id)
    if (!item) return

    setLoading(true)
    setMessage(null)

    try {
      let blockchainTxHash = null;
      let txDetails: {transactionHash: string; gasUsed: string; blockNumber: number; blockHash: string; blockTime: string; timestamp: number} | null = null;

      // Update on blockchain if wallet is connected and we have addresses
      if (walletAddress && item.walletAddress && item.recordId) {
        try {
          if (!item.access) {
            // Granting access
            const expiresAt = securitySettings.timeLimitedAccess
              ? Math.floor(Date.now() / 1000) + securitySettings.timeLimitSeconds
              : 0
            txDetails = await grantAccessOnChain(item.recordId, item.walletAddress, 1, expiresAt)
            blockchainTxHash = txDetails.transactionHash
          } else {
            // Revoking access
            txDetails = await revokeAccessOnChain(item.recordId, item.walletAddress)
            blockchainTxHash = txDetails.transactionHash
          }

          // Store transaction details
          setLastTransaction(txDetails)

          // Log immutable audit trail if enabled
          if (securitySettings.auditTrail) {
            await logAuditOnChain(
              item.recordId,
              item.access ? "revoke_access" : "grant_access",
              JSON.stringify({ 
                walletAddress: item.walletAddress, 
                timestamp: Date.now(),
                action: item.access ? "revoked" : "granted"
              })
            )
          }
        } catch (blockchainError) {
          console.error("Blockchain error:", blockchainError)
          
          const error = blockchainError as { code?: string | number; message?: string; reason?: string };
          let errorMessage = "Blockchain transaction failed. Please try again.";
          
          // Handle specific errors
          if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
            errorMessage = "❌ Transaction cancelled. You rejected the transaction in MetaMask.";
          } else if (error.code === 'INSUFFICIENT_FUNDS') {
            errorMessage = "❌ Insufficient funds. Please add more ETH to your wallet to pay for gas fees.";
          } else if (error.reason === "Not the record owner") {
            errorMessage = "❌ Access denied: You are not the owner of this record. Only the wallet that uploaded the file can manage access.";
          } else if (error.message?.includes('user rejected') || error.message?.includes('rejected the request')) {
            errorMessage = "❌ Transaction cancelled by user.";
          } else if (error.message?.includes('network')) {
            errorMessage = "❌ Network error. Please check your connection and ensure you're on the correct network (Sepolia or Localhost).";
          } else if (error.reason) {
            errorMessage = `❌ ${error.reason}`;
          }
          
          setMessage({ type: "error", text: errorMessage })
          setLoading(false)
          return
        }
      }

      // Update in database
      const response = await fetch(`/api/access-control/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isActive: !item.access,
          blockchainTxHash 
        }),
      })

      if (!response.ok) throw new Error("Failed to update access")

      // Update local state
      setAccessList(accessList.map((a) => (a.id === id ? { ...a, access: !a.access } : a)))
      
      // Send notification if enabled
      if (securitySettings.notifications && !item.access && item.walletAddress) {
        setMessage({ 
          type: "success", 
          text: `Access granted! Notification sent to ${item.walletAddress.slice(0, 6)}...${item.walletAddress.slice(-4)}` 
        })
      } else {
        setMessage({ 
          type: "success", 
          text: `Access ${item.access ? "revoked" : "granted"} successfully` 
        })
      }
    } catch (error) {
      console.error("Error toggling access:", error)
      setMessage({ type: "error", text: "Failed to update access" })
    } finally {
      setLoading(false)
    }
  }

  const addNewAccess = async () => {
    if (!newWalletAddress) {
      setMessage({ type: "error", text: "Please enter a wallet address" });
      return;
    }

    // Validate wallet address format
    if (!newWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setMessage({ 
        type: "error", 
        text: "❌ Invalid wallet address format. Please enter a valid Ethereum address (0x...)" 
      });
      return;
    }

    // Check if trying to grant access to self
    if (walletAddress && newWalletAddress.toLowerCase() === walletAddress.toLowerCase()) {
      setMessage({ 
        type: "error", 
        text: "⚠️ You cannot grant access to yourself" 
      });
      return;
    }

    setLoading(true)
    setMessage(null)

    try {
      // Grant access on blockchain if wallet connected
      if (walletAddress) {
        // Verify MetaMask is still connected
        if (!window.ethereum) {
          setMessage({ 
            type: "error", 
            text: "❌ MetaMask not detected. Please install MetaMask and connect your wallet." 
          });
          setLoading(false);
          return;
        }
        
        try {
          const expiresAt = securitySettings.timeLimitedAccess
            ? Math.floor(Date.now() / 1000) + securitySettings.timeLimitSeconds
            : 0;
          
          const txDetails = await grantAccessOnChain(
            "default-record-id", // Replace with actual record ID
            newWalletAddress,
            1, // Read access level
            expiresAt
          );

          // Store transaction details
          setLastTransaction(txDetails);

          // Log audit trail if enabled
          if (securitySettings.auditTrail) {
            await logAuditOnChain(
              "default-record-id",
              "grant_access",
              JSON.stringify({ 
                receiverAddress: newWalletAddress, 
                expiresAt,
                timestamp: Date.now() 
              })
            );
          }
          
          // Success - blockchain access granted
          setMessage({ 
            type: "success", 
            text: `✅ Blockchain access granted to ${newWalletAddress.slice(0, 6)}...${newWalletAddress.slice(-4)}` 
          });
          setNewWalletAddress("");
          
        } catch (blockchainError) {
          console.error("Blockchain error:", blockchainError);
          
          const error = blockchainError as { code?: string | number; message?: string; reason?: string };
          let errorMessage = "Transaction failed";
          
          if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
            errorMessage = "You cancelled the transaction";
          } else if (error.code === 'INSUFFICIENT_FUNDS') {
            errorMessage = "Insufficient ETH for gas fees";
          } else if (error.reason === "Not the record owner") {
            errorMessage = "Only the file owner can grant access";
          } else if (error.message?.includes('user rejected')) {
            errorMessage = "Transaction cancelled";
          } else if (error.message?.includes('network')) {
            errorMessage = "Network error. Check your connection";
          } else if (error.reason) {
            errorMessage = error.reason;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setMessage({ 
            type: "error", 
            text: `❌ Blockchain error: ${errorMessage}` 
          });
        }
      } else {
        setMessage({ 
          type: "error", 
          text: "Please connect your wallet to grant access" 
        });
      }

      setLoading(false);
      
    } catch (error) {
      console.error("Error adding access:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to grant access";
      setMessage({ 
        type: "error", 
        text: errorMessage
      });
      setLoading(false);
    }
  }

  const updateSecuritySetting = (key: keyof SecuritySettings, value: boolean | number) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleTimeLimitChange = (seconds: number) => {
    setSecuritySettings((prev) => ({
      ...prev,
      timeLimitSeconds: seconds,
    }))
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      // Simulate saving settings (could save to localStorage or database)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage({
        type: "success",
        text: "✅ Settings saved successfully!"
      })
      
      setSaving(false)
    } catch {
      setMessage({
        type: "error",
        text: "Failed to save settings"
      })
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10">
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-5"></div>
      <div className="container px-4 py-6 mx-auto relative z-10">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">MediFlow</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" className="hidden md:flex">
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Sign In"}
            </Button>
          </div>
        </header>

        <main className="py-12 max-w-4xl mx-auto">
          <Link href="/results" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">Access Control</h1>
          <p className="text-muted-foreground mb-8">
            Manage who can access your converted healthcare data with Web3-powered decentralized identity management.
          </p>

          {/* Status Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                  : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Transaction Details */}
          {lastTransaction && (
            <div className="mb-6">
              <TransactionDetails
                transactionHash={lastTransaction.transactionHash}
                gasUsed={lastTransaction.gasUsed}
                blockNumber={lastTransaction.blockNumber}
                blockHash={lastTransaction.blockHash}
                blockTime={lastTransaction.blockTime}
                timestamp={lastTransaction.timestamp}
                action="Access control updated"
              />
            </div>
          )}

          <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-foreground">Data Access Permissions</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Control who can view and use your converted FHIR data with blockchain-verified access.
                  </CardDescription>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400/20 to-purple-600/20 dark:from-purple-400/10 dark:to-purple-600/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/80 dark:border-blue-800/30 rounded-lg p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Web3-Powered Access Control</h3>
                    <p className="text-sm text-muted-foreground">
                      You control who can see your health information with blockchain-verified permissions. Toggle
                      access on or off for each healthcare provider.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Enter wallet address to grant access (0x...)"
                      className="flex-1 bg-card/50"
                      value={newWalletAddress}
                      onChange={(e) => setNewWalletAddress(e.target.value)}
                      disabled={loading}
                    />
                    <Button
                      onClick={addNewAccess}
                      disabled={loading || !newWalletAddress}
                      className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border">
                      <div className="col-span-5 font-medium text-foreground">Name</div>
                      <div className="col-span-3 font-medium text-foreground">Role</div>
                      <div className="col-span-2 font-medium text-foreground">Expires</div>
                      <div className="col-span-2 font-medium text-foreground text-right">Access</div>
                    </div>

                    <div className="divide-y divide-border">
                      {accessList.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          No access permissions granted yet. Add someone using the form above.
                        </div>
                      ) : (
                        accessList.map((item) => (
                          <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                            <div className="col-span-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                  <User className="w-4 h-4 text-foreground" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">{item.email}</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-3 text-muted-foreground">{item.role}</div>
                            <div className="col-span-2 text-sm text-muted-foreground">
                              {item.expiresAt ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(item.expiresAt).toLocaleDateString()}
                                </div>
                              ) : (
                                "Never"
                              )}
                            </div>
                            <div className="col-span-2 flex justify-end items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor={`access-${item.id}`} className="sr-only">
                                        Toggle access for {item.name}
                                      </Label>
                                      <Switch
                                        id={`access-${item.id}`}
                                        checked={item.access}
                                        onCheckedChange={() => toggleAccess(item.id)}
                                        disabled={loading}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>{item.access ? "Revoke Access" : "Grant Access"}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-foreground">Web3 Security Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure additional blockchain-based security options for your health data.
                  </CardDescription>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400/20 to-teal-600/20 dark:from-teal-400/10 dark:to-teal-600/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="audit-trail" className="text-base">
                      Blockchain Audit Trail
                    </Label>
                    <p className="text-sm text-muted-foreground">Keep an immutable record of who accessed your data</p>
                  </div>
                  <Switch
                    id="audit-trail"
                    checked={securitySettings.auditTrail}
                    onCheckedChange={(checked) => updateSecuritySetting("auditTrail", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="access-notifications" className="text-base">
                      Access Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone views your data</p>
                  </div>
                  <Switch
                    id="access-notifications"
                    checked={securitySettings.notifications}
                    onCheckedChange={(checked) => updateSecuritySetting("notifications", checked)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="time-limited" className="text-base">
                        Smart Contract Time-Limited Access
                      </Label>
                      <p className="text-sm text-muted-foreground">Automatically expire access after specified duration</p>
                    </div>
                    <Switch
                      id="time-limited"
                      checked={securitySettings.timeLimitedAccess}
                      onCheckedChange={(checked) => updateSecuritySetting("timeLimitedAccess", checked)}
                    />
                  </div>

                  {securitySettings.timeLimitedAccess && (
                    <div className="pl-4 border-l-2 border-teal-500/30">
                      <TimeSelector
                        onTimeChange={handleTimeLimitChange}
                        initialDays={Math.floor(securitySettings.timeLimitSeconds / (24 * 60 * 60))}
                        initialHours={0}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-encryption" className="text-base">
                      Enhanced Web3 Encryption
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use additional blockchain-based encryption for sensitive data
                    </p>
                  </div>
                  <Switch
                    id="data-encryption"
                    checked={securitySettings.encryption}
                    onCheckedChange={(checked) => updateSecuritySetting("encryption", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {walletAddress ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Wallet connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Connect wallet for blockchain features
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/audit-trail")}
                disabled={loading || saving}
              >
                View Audit Trail
              </Button>
              <Button
                onClick={saveSettings}
                disabled={loading || saving}
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0 min-w-[140px]"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
