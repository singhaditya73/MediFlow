'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConnectWallet() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already connected
    const savedAddress = localStorage.getItem('walletAddress');
    const savedUser = localStorage.getItem('user');
    
    if (savedAddress && savedUser) {
      router.push('/');
    }
  }, [router]);

  const connectWallet = async () => {
    setError('');
    setIsConnecting(true);

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        setError('Please install MetaMask to continue');
        setIsConnecting(false);
        return;
      }

      // Request wallet connection
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const address = accounts[0];
      setWalletAddress(address);

      // Create a message to sign
      const message = `Sign this message to authenticate with MediFlow.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;

      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Authenticate with backend
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message,
          name: name || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user data to localStorage
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push('/');
      } else if (data.needsRegistration) {
        setNeedsRegistration(true);
        setError('');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">MediFlow</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet to access your health records
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {needsRegistration && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-md text-sm">
              Welcome! Please enter your name to create an account.
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-mono break-all">
                {walletAddress}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={connectWallet}
          disabled={isConnecting || (needsRegistration && !name)}
          className="w-full"
          size="lg"
        >
          {isConnecting
            ? 'Connecting...'
            : needsRegistration
            ? 'Complete Registration'
            : 'Connect Wallet'}
        </Button>

        {walletAddress && !needsRegistration && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}

        <div className="text-center text-xs text-gray-500 dark:text-gray-500">
          By connecting your wallet, you agree to our Terms of Service and
          Privacy Policy
        </div>
      </Card>
    </div>
  );
}
