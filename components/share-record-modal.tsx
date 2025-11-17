"use client"

import { useState } from "react"
import { X, Share2, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeSelector } from "@/components/time-selector"
import { grantAccessOnChain, logAuditOnChain } from "@/lib/blockchain"

interface ShareRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  record: {
    id: string
    fileName: string
    ipfsHash: string
    resourceType: string
  }
}

export function ShareRecordModal({ isOpen, onClose, onSuccess, record }: ShareRecordModalProps) {
  const [recipientWallet, setRecipientWallet] = useState("")
  const [accessLevel, setAccessLevel] = useState<1 | 2>(1) // 1 = Read, 2 = Write
  const [timeLimitedAccess, setTimeLimitedAccess] = useState(false)
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(30 * 24 * 60 * 60) // 30 days
  const [auditTrail, setAuditTrail] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  if (!isOpen) return null

  const handleShare = async () => {
    if (!recipientWallet || !recipientWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      setMessage({ type: "error", text: "Please enter a valid Ethereum wallet address" })
      return
    }

    setLoading(true)
    setMessage(null)
    setTxHash(null)

    try {
      // Calculate expiry time
      const expiresAt = timeLimitedAccess
        ? Math.floor(Date.now() / 1000) + timeLimitSeconds
        : 0

      // Grant access on blockchain
      let txResult: {
        transactionHash: string;
        gasUsed: string;
        blockNumber: number;
        blockHash: string;
        blockTime: string;
        timestamp: number;
      };
      try {
        txResult = await grantAccessOnChain(
          record.id,
          recipientWallet,
          accessLevel,
          expiresAt
        )
        setTxHash(txResult.transactionHash)
      } catch (txError: unknown) {
        console.error("Transaction error:", txError)
        
        const error = txError as { code?: string | number; message?: string; reason?: string };
        
        // Handle "Not the record owner" error
        if (error.reason === "Not the record owner") {
          throw new Error(
            "❌ Access Denied: You are not the owner of this record.\n\n" +
            "Only the wallet that uploaded this file can share it.\n" +
            "Please connect with the wallet address that originally uploaded this record."
          )
        }
        
        // Handle user rejection
        if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
          throw new Error("❌ Transaction cancelled. You rejected the transaction in MetaMask.")
        }
        
        // Handle insufficient funds
        if (error.code === 'INSUFFICIENT_FUNDS') {
          throw new Error("❌ Insufficient funds. Please add more ETH to your wallet.")
        }
        
        // Handle wrong network
        const errorMessage = error.message || '';
        if (errorMessage.includes('chain') || errorMessage.includes('network')) {
          throw new Error("❌ Wrong network. Please switch to Sepolia testnet or Localhost in MetaMask.")
        }
        
        // Generic error with reason if available
        const displayError = error.reason 
          ? `❌ ${error.reason}` 
          : errorMessage || "❌ Transaction failed. Please try again.";
        throw new Error(displayError)
      }

      // Log audit if enabled
      if (auditTrail) {
        try {
          await logAuditOnChain(
            record.id,
            "grant_access",
            JSON.stringify({
              recipientWallet,
              accessLevel: accessLevel === 1 ? "read" : "write",
              expiresAt: expiresAt || "never",
              fileName: record.fileName,
              ipfsHash: record.ipfsHash,
              timestamp: Date.now(),
            })
          )
        } catch (auditError) {
          console.warn("Audit log failed (non-critical):", auditError)
          // Continue even if audit fails
        }
      }

      // Save to localStorage for quick access
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const currentWallet = user.walletAddress || localStorage.getItem('walletAddress')
      
      console.log('Current user wallet:', currentWallet);
      console.log('Recipient wallet:', recipientWallet);
      console.log('Sharing record:', record);
      
      // Save to "Shared By Me" list
      const sharedByMe = JSON.parse(
        localStorage.getItem(`shared_by_${currentWallet}`) || "[]"
      )

      const shareData = {
        recordId: record.id,
        fileName: record.fileName,
        ipfsHash: record.ipfsHash,
        resourceType: record.resourceType,
        recipientWallet,
        accessLevel: accessLevel === 1 ? "read" : "write",
        expiresAt: expiresAt || null,
        sharedAt: new Date().toISOString(),
        transactionHash: txResult,
      }

      sharedByMe.push(shareData)
      localStorage.setItem(`shared_by_${currentWallet}`, JSON.stringify(sharedByMe))
      console.log('Saved to shared_by_' + currentWallet, sharedByMe);

      // Save to recipient's "Shared With Me" list
      const receivedRecords = JSON.parse(
        localStorage.getItem(`received_${recipientWallet}`) || "[]"
      )

      const receivedData = {
        id: record.id,
        fileName: record.fileName,
        ipfsHash: record.ipfsHash,
        resourceType: record.resourceType,
        createdAt: new Date().toISOString(),
        sharedBy: currentWallet,
        accessLevel: accessLevel === 1 ? "read" : "write",
        expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
        transactionHash: txResult,
      }

      receivedRecords.push(receivedData)
      localStorage.setItem(`received_${recipientWallet}`, JSON.stringify(receivedRecords))
      console.log('Saved to received_' + recipientWallet, receivedRecords);

      // Also save to API database
      try {
        await fetch("/api/access-control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordId: record.id,
            receiverAddress: recipientWallet,
            accessLevel: accessLevel === 1 ? "read" : "write",
            expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : null,
            blockchainTxHash: txResult,
            ipfsHash: record.ipfsHash,
            fileName: record.fileName,
          }),
        })
      } catch (apiError) {
        console.error("Failed to save to database:", apiError)
        // Continue anyway since blockchain transaction succeeded
      }

      setMessage({
        type: "success",
        text: `✅ Access granted! ${recipientWallet.slice(0, 6)}...${recipientWallet.slice(-4)} can now access this record.`,
      })

      // Call success callback to refresh parent component
      if (onSuccess) {
        onSuccess()
      }

      // Clear form
      setRecipientWallet("")
    } catch (error) {
      console.error("Failed to grant access:", error)
      const errorMessage = error instanceof Error ? error.message : "Transaction failed"
      setMessage({ type: "error", text: `Failed to grant access: ${errorMessage}` })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRecipientWallet("")
    setMessage(null)
    setTxHash(null)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Share Medical Record</CardTitle>
                <CardDescription className="mt-1">
                  Grant secure blockchain-verified access to this record
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} disabled={loading}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Owner Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> Only the wallet that uploaded this file can share it. 
                Make sure you&apos;re connected with the correct wallet in MetaMask.
              </p>
            </div>
          </div>

          {/* Record Info */}
          <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground mb-1">{record.fileName}</h4>
                <p className="text-sm text-muted-foreground mb-2">Type: {record.resourceType}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">IPFS:</span>
                  <span className="font-mono truncate">{record.ipfsHash}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Wallet */}
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Recipient Wallet Address *</Label>
            <Input
              id="wallet-address"
              type="text"
              placeholder="0x..."
              value={recipientWallet}
              onChange={(e) => setRecipientWallet(e.target.value)}
              disabled={loading || !!txHash}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter the Ethereum wallet address of the person you want to share with
            </p>
          </div>

          {/* Access Level */}
          <div className="space-y-2">
            <Label>Access Level</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccessLevel(1)}
                disabled={loading || !!txHash}
                className={`p-4 rounded-lg border-2 transition-all ${
                  accessLevel === 1
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/20"
                    : "border-border hover:border-teal-300 dark:hover:border-teal-700"
                }`}
              >
                <div className="font-medium mb-1">Read Only</div>
                <div className="text-xs text-muted-foreground">Can view the record</div>
              </button>
              <button
                type="button"
                onClick={() => setAccessLevel(2)}
                disabled={loading || !!txHash}
                className={`p-4 rounded-lg border-2 transition-all ${
                  accessLevel === 2
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/20"
                    : "border-border hover:border-teal-300 dark:hover:border-teal-700"
                }`}
              >
                <div className="font-medium mb-1">Read & Write</div>
                <div className="text-xs text-muted-foreground">Can view and modify</div>
              </button>
            </div>
          </div>

          {/* Time-Limited Access */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="time-limited" className="text-base">
                  Time-Limited Access
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically expire access after a specified duration
                </p>
              </div>
              <Switch
                id="time-limited"
                checked={timeLimitedAccess}
                onCheckedChange={setTimeLimitedAccess}
                disabled={loading || !!txHash}
              />
            </div>

            {timeLimitedAccess && (
              <div className="pl-4 border-l-2 border-teal-500/30">
                <TimeSelector
                  onTimeChange={setTimeLimitSeconds}
                  initialDays={Math.floor(timeLimitSeconds / (24 * 60 * 60))}
                  initialHours={0}
                />
              </div>
            )}
          </div>

          {/* Audit Trail */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="audit" className="text-base">
                Blockchain Audit Trail
              </Label>
              <p className="text-sm text-muted-foreground">
                Keep immutable record of this access grant
              </p>
            </div>
            <Switch
              id="audit"
              checked={auditTrail}
              onCheckedChange={setAuditTrail}
              disabled={loading || !!txHash}
            />
          </div>

          {/* Status Messages */}
          {message && (
            <div
              className={`p-4 rounded-lg border flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                  : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Transaction Hash */}
          {txHash && message?.type === "success" && (
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
              <p className="text-sm font-medium text-foreground mb-2">✅ Transaction Confirmed</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white/50 dark:bg-gray-900/50 px-2 py-1 rounded flex-1 overflow-x-auto">
                  {txHash}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank")}
                  className="shrink-0"
                >
                  View on Etherscan
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {message?.type === "success" ? (
              <Button
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
              >
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={loading || !recipientWallet}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Granting Access...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Grant Access
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
