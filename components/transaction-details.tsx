"use client"

import { useState } from "react"
import { Copy, Check, ExternalLink, Clock, Zap, Box } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TransactionDetailsProps {
  transactionHash: string
  gasUsed?: string | number
  blockNumber?: string | number
  blockHash?: string
  blockTime?: string
  timestamp?: number
  action?: string
  className?: string
  explorerUrl?: string
}

export function TransactionDetails({
  transactionHash,
  gasUsed,
  blockNumber,
  blockHash,
  blockTime,
  timestamp,
  action,
  className = "",
  explorerUrl,
}: TransactionDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const formatDate = (time?: string | number) => {
    if (!time) return "Unknown"
    if (typeof time === "string") return time
    return new Date(time * 1000).toLocaleString()
  }

  const truncateHash = (hash: string, length = 10) => {
    if (hash.length <= length * 2) return hash
    return `${hash.slice(0, length)}...${hash.slice(-length)}`
  }

  return (
    <Card className={`bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-200 dark:border-teal-800 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Transaction Confirmed
            </CardTitle>
            <CardDescription>
              {action ? `${action} recorded on blockchain` : "Blockchain transaction details"}
            </CardDescription>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400/20 to-green-600/20 dark:from-green-400/10 dark:to-green-600/10 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Transaction Hash */}
        <div className="bg-white/60 dark:bg-gray-900/40 rounded-lg p-3 border border-teal-100 dark:border-teal-900">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-muted-foreground">Transaction Hash</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(transactionHash, "txHash")}
              >
                {copiedField === "txHash" ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => window.open(explorerUrl || `https://etherscan.io/tx/${transactionHash}`, "_blank")}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-sm font-mono text-foreground break-all">
            {truncateHash(transactionHash, 16)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Gas Used */}
          {gasUsed !== undefined && (
            <div className="bg-white/60 dark:bg-gray-900/40 rounded-lg p-3 border border-teal-100 dark:border-teal-900">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-medium text-muted-foreground">Gas Used</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{gasUsed.toString()}</p>
            </div>
          )}

          {/* Block Number */}
          {blockNumber !== undefined && (
            <div className="bg-white/60 dark:bg-gray-900/40 rounded-lg p-3 border border-teal-100 dark:border-teal-900">
              <div className="flex items-center gap-2 mb-1">
                <Box className="w-3 h-3 text-purple-500" />
                <span className="text-xs font-medium text-muted-foreground">Block Number</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{blockNumber.toString()}</p>
            </div>
          )}
        </div>

        {/* Block Hash */}
        {blockHash && (
          <div className="bg-white/60 dark:bg-gray-900/40 rounded-lg p-3 border border-teal-100 dark:border-teal-900">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-muted-foreground">Block Hash</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(blockHash, "blockHash")}
              >
                {copiedField === "blockHash" ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <p className="text-xs font-mono text-foreground break-all">
              {truncateHash(blockHash, 16)}
            </p>
          </div>
        )}

        {/* Block Time */}
        {(blockTime || timestamp) && (
          <div className="bg-white/60 dark:bg-gray-900/40 rounded-lg p-3 border border-teal-100 dark:border-teal-900">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Block Time</span>
            </div>
            <p className="text-sm text-foreground">{formatDate(blockTime || timestamp)}</p>
          </div>
        )}

        <div className="pt-2 border-t border-teal-100 dark:border-teal-900">
          <p className="text-xs text-center text-muted-foreground">
            🔐 Permanently recorded on the blockchain
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
