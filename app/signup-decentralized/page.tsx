'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SignupPageDecentralized() {
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already connected
    const savedAddress = localStorage.getItem('walletAddress');
    const savedName = localStorage.getItem('userName');
    
    if (savedAddress && savedName) {
      router.push('/dashboard');
    }
  }, [router]);

  const connectWallet = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Check if Ethereum wallet is installed
      if (!window.ethereum) {
        setError('Please install MetaMask or another Ethereum wallet to continue');
        setIsLoading(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        setError('No accounts found. Please check your wallet.');
        setIsLoading(false);
        return;
      }

      const address = accounts[0];
      setWalletAddress(address);

      // Check if name exists in localStorage for this wallet
      const savedName = localStorage.getItem(`userName_${address}`);
      
      if (!savedName && !name) {
        // Need to ask for name
        setError('');
        setIsLoading(false);
        return;
      }

      const userName = name || savedName;

      // Create a message to sign (proves wallet ownership)
      const message = `Welcome to MediFlow!\n\nSign this message to authenticate.\n\nWallet: ${address}\nName: ${userName}\nTimestamp: ${Date.now()}`;

      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Store everything locally (no database needed!)
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('userName', userName);
      localStorage.setItem(`userName_${address}`, userName);
      localStorage.setItem('signature', signature);
      localStorage.setItem('signedMessage', message);
      localStorage.setItem('loginTimestamp', Date.now().toString());

      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      if (err.code === 4001) {
        setError('You rejected the connection request. Please try again.');
      } else if (err.code === -32002) {
        setError('Connection request already pending. Please check MetaMask.');
      } else {
        setError(err.message || 'Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundElements = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      width: 50 + ((i * 37) % 300),
      height: 50 + ((i * 43) % 300),
      left: `${(i * 13) % 100}%`,
      top: `${(i * 17) % 100}%`,
      duration: 10 + ((i * 7) % 10),
      delay: (i * 0.8) % 5,
      key: i
    }));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 -z-10">
        {backgroundElements.map((element) => (
          <motion.div
            key={element.key}
            className="absolute rounded-full bg-primary/5 dark:bg-primary/10"
            style={{
              width: element.width,
              height: element.height,
              left: element.left,
              top: element.top,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: element.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: element.delay,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="container flex flex-1 items-center justify-center py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 shadow-lg backdrop-blur-sm bg-background/80">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Connect Your Wallet</CardTitle>
              <CardDescription>
                100% Decentralized - No database, only blockchain + local storage
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {walletAddress && !name && !localStorage.getItem(`userName_${walletAddress}`) ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-md text-sm">
                    Welcome! Enter your name (stored locally on your device).
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="transition-all border-muted-foreground/20 focus:border-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-mono break-all">
                      {walletAddress}
                    </div>
                  </div>

                  <Button
                    onClick={connectWallet}
                    disabled={isLoading || !name}
                    className="w-full transition-all hover:shadow-md hover:shadow-primary/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      'Sign & Continue'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-green-900 dark:text-green-100 font-semibold">
                      🔒 Fully Decentralized
                    </div>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>✓ No central database</li>
                      <li>✓ Data on blockchain & IPFS</li>
                      <li>✓ You control your keys</li>
                      <li>✓ Name stored locally only</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-semibold">
                      <Wallet className="w-5 h-5" />
                      Ethereum Wallets Supported
                    </div>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-7">
                      <li>• MetaMask (Recommended)</li>
                      <li>• Coinbase Wallet</li>
                      <li>• Any Ethereum-compatible wallet</li>
                    </ul>
                  </div>

                  <Button
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="w-full h-12 text-lg bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-5 w-5" />
                        Connect Wallet
                      </>
                    )}
                  </Button>

                  {walletAddress && (
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center text-muted-foreground">
                Already connected?{" "}
                <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
                  Sign in with wallet
                </Link>
              </div>
              <div className="text-xs text-center text-muted-foreground">
                By connecting your wallet, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
