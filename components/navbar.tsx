'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { Zap, User, LogOut, Upload, Database, Shield } from 'lucide-react';

export function Navbar() {
  const [user, setUser] = useState<{ name: string; walletAddress: string } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Get user initials from name
  const getInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length === 1) {
      // Single word: take first 2 characters
      return words[0].slice(0, 2).toUpperCase();
    }
    // Multiple words: take first letter of first and last word
    const first = words[0][0];
    const last = words[words.length - 1][0];
    return (first + last).toUpperCase();
  };

  useEffect(() => {
    setIsClient(true);
    
    // Check if user is logged in
    const walletAddress = localStorage.getItem('walletAddress');
    const userName = localStorage.getItem('userName');

    if (walletAddress && userName) {
      setUser({
        name: userName,
        walletAddress,
      });
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userName');
    localStorage.removeItem('user');
    localStorage.removeItem('signature');
    localStorage.removeItem('loginTimestamp');
    
    setUser(null);
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  if (!isClient) {
    return null; // Avoid hydration mismatch
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">MediFlow</h1>
        </Link>

        {/* Navigation - Only show if logged in */}
        {user && (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/upload') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Upload
            </Link>
            <Link
              href="/records"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/records') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Records
            </Link>
            <Link
              href="/access-control"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/access-control') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Access Control
            </Link>
          </nav>
        )}

        {/* Right side - Theme toggle and User menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0 hover:bg-transparent">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(user.name)}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground font-mono">
                      {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/upload')}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Upload Records</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/records')}>
                  <Database className="mr-2 h-4 w-4" />
                  <span>My Records</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/access-control')}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Access Control</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnect Wallet</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline">
              <Link href="/signup">Connect Wallet</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
