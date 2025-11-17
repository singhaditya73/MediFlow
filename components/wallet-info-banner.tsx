"use client";

import { AlertCircle, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function WalletInfoBanner() {
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [hasWrongWallet, setHasWrongWallet] = useState(false);

  useEffect(() => {
    // Check for MetaMask
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      setHasMetaMask(true);
    }

    // Check for other wallets that might be installed
    if (typeof window !== 'undefined' && window.ethereum && !window.ethereum.isMetaMask) {
      setHasWrongWallet(true);
    }
  }, []);

  if (hasMetaMask) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              MetaMask Detected ✓
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200">
              Your wallet is ready! Click the button below to connect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              MetaMask Required
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
              MediFlow uses <strong>Ethereum blockchain</strong>, not Solana. You need MetaMask wallet.
            </p>
          </div>

          {hasWrongWallet && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <strong>Wrong Wallet Detected:</strong> We detected a non-Ethereum wallet (possibly Phantom). 
                  Please install MetaMask for Ethereum support.
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-white dark:bg-gray-800 rounded border border-amber-200 dark:border-amber-700 p-3">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-red-700 dark:text-red-400">Not Compatible</span>
              </div>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>❌ Phantom (Solana)</li>
                <li>❌ Solflare (Solana)</li>
                <li>❌ Backpack (Solana)</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700 p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-green-700 dark:text-green-400">Compatible</span>
              </div>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>✅ MetaMask (Required)</li>
                <li>✅ Coinbase Wallet</li>
                <li>✅ Rainbow Wallet</li>
              </ul>
            </div>
          </div>

          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Install MetaMask
            <ExternalLink className="w-4 h-4" />
          </a>

          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-amber-900 dark:text-amber-100 mb-2">
              Why MetaMask? (Click to learn more)
            </summary>
            <div className="pl-4 space-y-2 text-amber-800 dark:text-amber-200">
              <p>
                <strong>Blockchain Type:</strong> MediFlow uses Ethereum smart contracts for secure 
                health record management. Phantom is a Solana wallet and won&apos;t work.
              </p>
              <p>
                <strong>Features:</strong> Our system uses:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Smart contracts for access control</li>
                <li>Immutable audit trails on Ethereum</li>
                <li>IPFS for decentralized file storage</li>
                <li>EVM-compatible blockchain integration</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
