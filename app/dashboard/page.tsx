'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  walletAddress: string;
  name: string;
  aadhaarNumber?: string;
  phoneNumber?: string;
  createdAt: string;
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const walletAddress = localStorage.getItem('walletAddress');
      const savedUser = localStorage.getItem('user');

      if (!walletAddress || !savedUser) {
        router.replace('/signup');
        return;
      }

      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        router.replace('/signup');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('user');
    router.push('/connect-wallet');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Disconnect Wallet
          </Button>
        </div>

        {/* User Profile Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">
                Name
              </Label>
              <p className="text-lg font-medium">{user.name}</p>
            </div>

            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">
                Wallet Address
              </Label>
              <p className="text-lg font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-md break-all">
                {user.walletAddress}
              </p>
            </div>

            {user.aadhaarNumber && (
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">
                  Aadhaar Number
                </Label>
                <p className="text-lg font-medium">{user.aadhaarNumber}</p>
              </div>
            )}

            {user.phoneNumber && (
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">
                  Phone Number
                </Label>
                <p className="text-lg font-medium">{user.phoneNumber}</p>
              </div>
            )}

            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">
                Member Since
              </Label>
              <p className="text-lg font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => router.push('/upload')}
              className="h-20 text-lg"
            >
              Upload Records
            </Button>
            
            <Button 
              onClick={() => router.push('/records')}
              variant="outline"
              className="h-20 text-lg"
            >
              View Records
            </Button>
            
            <Button 
              onClick={() => router.push('/access-control')}
              variant="outline"
              className="h-20 text-lg"
            >
              Manage Access
            </Button>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🔒 Your Data is Secure
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            All your health records are encrypted and stored on the blockchain. 
            You have full control over who can access your data through smart contracts.
          </p>
        </Card>
      </div>
    </div>
  );
}
