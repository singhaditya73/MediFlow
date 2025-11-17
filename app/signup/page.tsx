"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletInfoBanner } from "@/components/wallet-info-banner";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already connected
    const checkAuth = () => {
      const savedAddress = localStorage.getItem('walletAddress');
      const savedUser = localStorage.getItem('user');
      
      if (savedAddress && savedUser) {
        router.replace('/dashboard');
      }
    };
    
    checkAuth();
  }, [router]);
  const connectWallet = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Check if Ethereum wallet is installed
      if (typeof window === 'undefined') {
        setError('⚠️ Please use a web browser to connect your wallet');
        setIsLoading(false);
        return;
      }

      if (!window.ethereum) {
        setError('❌ MetaMask not detected. Please install MetaMask extension from metamask.io');
        window.open('https://metamask.io/download/', '_blank');
        setIsLoading(false);
        return;
      }

      // Check if MetaMask is installed
      if (!window.ethereum.isMetaMask) {
        console.warn('Non-MetaMask wallet detected');
        setError('⚠️ Please use MetaMask wallet for the best experience');
      }

      console.log('📡 Requesting account access...');
      
      // Request account access with error handling
      let accounts;
      try {
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
      } catch (reqError: unknown) {
        const error = reqError as { code?: number; message?: string };
        if (error.code === 4001) {
          throw new Error('You rejected the connection request. Please try again.');
        } else if (error.code === -32002) {
          throw new Error('Connection request already pending. Please check MetaMask.');
        }
        throw reqError;
      }

      if (!accounts || accounts.length === 0) {
        setError('❌ No accounts found. Please unlock your wallet and try again.');
        setIsLoading(false);
        return;
      }

      const address = accounts[0];
      console.log('✅ Connected to wallet:', address);
      setWalletAddress(address);

      // Check current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current network:', chainId);

      // Try to switch to localhost or Sepolia
      try {
        // Check if already on localhost (0x7A69 = 31337) or Sepolia (0xaa36a7 = 11155111)
        if (chainId !== '0x7A69' && chainId !== '0xaa36a7') {
          console.log('🔄 Attempting to switch network...');
          
          // Try Sepolia first
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Sepolia
            });
            console.log('✅ Switched to Sepolia network');
          } catch (sepoliaError: unknown) {
            const error = sepoliaError as { code?: number };
            // If Sepolia not available, try localhost
            if (error.code === 4902) {
              console.log('Sepolia not found, trying localhost...');
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x7A69' }], // Localhost
              });
              console.log('✅ Switched to Localhost network');
            } else {
              throw sepoliaError;
            }
          }
        } else {
          console.log('✅ Already on correct network');
        }
      } catch (switchError: unknown) {
        const error = switchError as { code?: number; message?: string };
        console.warn('Network switch error:', switchError);
        
        // This error code indicates that the chain has not been added to MetaMask
        if (error.code === 4902) {
          console.log('⚠️ Network not found, attempting to add...');
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x7A69',
                  chainName: 'Localhost 8545',
                  rpcUrls: ['http://127.0.0.1:8545'],
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                },
              ],
            });
            console.log('✅ Network added successfully');
          } catch (addError: unknown) {
            console.error('Failed to add network:', addError);
            setError(
              '⚠️ Could not add network automatically.\n\n' +
              'Please manually add one of these networks:\n' +
              '• Sepolia Testnet (Chain ID: 11155111)\n' +
              '• Localhost (Chain ID: 31337, RPC: http://127.0.0.1:8545)'
            );
            setIsLoading(false);
            return;
          }
        } else if (error.code === 4001) {
          setError('❌ You rejected the network switch request.');
          setIsLoading(false);
          return;
        } else {
          console.warn('Network switch failed:', error.message);
          setError(
            '⚠️ Could not switch network. Please manually switch to:\n' +
            '• Sepolia Testnet, or\n' +
            '• Localhost (Chain ID: 31337)'
          );
        }
      }

      console.log('✅ Network check complete');

      // Check if user has set name for this wallet before
      const savedName = localStorage.getItem(`userName_${address.toLowerCase()}`);
      
      if (!savedName && !name) {
        // Need to collect name first
        setNeedsRegistration(true);
        setIsLoading(false);
        return;
      }

      const finalName = name || savedName || 'Anonymous User';

      // Create a message to sign (proves wallet ownership)
      const message = `Sign this message to authenticate with MediFlow.\n\nWallet: ${address}\nName: ${finalName}\nTimestamp: ${Date.now()}`;

      console.log('📝 Requesting signature...');
      
      // Request signature with error handling
      let signature;
      try {
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, address],
        });
        console.log('✅ Signature received');
      } catch (signError: unknown) {
        const error = signError as { code?: number; message?: string };
        if (error.code === 4001) {
          throw new Error('You rejected the signature request. Signature is required to verify wallet ownership.');
        }
        console.error('Signature error:', signError);
        throw new Error('Failed to sign message. Please try again.');
      }

      // Store user data locally (no database needed!)
      const userData = {
        walletAddress: address.toLowerCase(),
        name: finalName,
        createdAt: new Date().toISOString(),
      };

      console.log('💾 Saving user data...');
      localStorage.setItem('walletAddress', address.toLowerCase());
      localStorage.setItem('userName', finalName);
      localStorage.setItem(`userName_${address.toLowerCase()}`, finalName);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('signature', signature);
      localStorage.setItem('loginTimestamp', Date.now().toString());

      console.log('✅ Authentication complete!');
      console.log('🚀 Redirecting to dashboard...');
      
      // Redirect to dashboard (use replace to prevent back button issues)
      router.replace('/dashboard');
      
    } catch (err: unknown) {
      console.error('Wallet connection error:', err);
      
      const error = err as { code?: number; message?: string };
      
      // Handle specific MetaMask error codes
      if (error.code === 4001) {
        // User rejected the request
        setError('❌ Connection rejected. You cancelled the request in MetaMask.');
      } else if (error.code === -32002) {
        // Request already pending
        setError('⏳ Request pending. Please check MetaMask - there may be a pending request waiting for your approval.');
      } else if (error.code === -32603) {
        // Internal error
        setError('❌ MetaMask internal error. Please try restarting MetaMask.');
      } else if (error.message?.includes('rejected the signature') || error.message?.includes('Signature is required')) {
        setError('❌ You rejected the signature request. Signature is required to verify wallet ownership.');
      } else if (error.message?.includes('Failed to sign')) {
        setError('❌ Failed to sign message. Please try again.');
      } else if (error.message?.includes('Already processing')) {
        setError('⏳ Already processing a request. Please wait and check MetaMask.');
      } else if (error.message?.includes('User denied') || error.message?.includes('denied')) {
        setError('❌ You denied the request. Please try again and approve in MetaMask.');
      } else if (error.message?.includes('rejected the connection')) {
        setError('❌ You rejected the connection request. Please try again.');
      } else if (error.message?.includes('network')) {
        setError('❌ Network error. Please check your internet connection and try again.');
      } else if (!window.ethereum) {
        setError('❌ MetaMask not detected. Please install MetaMask extension.');
      } else {
        // Generic error with more details
        const errorMsg = error.message || 'Unknown error occurred';
        setError(`❌ ${errorMsg}`);
        console.error('Full error details:', err);
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10 relative overflow-hidden">
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
                100% Decentralized - No database required, blockchain-powered authentication
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <WalletInfoBanner />
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {needsRegistration ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-md text-sm">
                    Welcome! Please enter your name to complete registration.
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
                        Completing Registration...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-semibold">
                      <Wallet className="w-5 h-5" />
                      MetaMask Required
                    </div>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-7">
                      <li>• Install MetaMask browser extension</li>
                      <li>• Connects to local Ethereum network</li>
                      <li>• Secure blockchain authentication</li>
                    </ul>
                    {!window.ethereum && (
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 underline mt-2 block"
                      >
                        → Download MetaMask
                      </a>
                    )}
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

            {/* Footer */}
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
                  Connect wallet
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
