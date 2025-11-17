"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const walletAddress = localStorage.getItem('walletAddress');
    const user = localStorage.getItem('user');

    if (!walletAddress || !user) {
      // Not authenticated, redirect to signup
      router.replace('/signup');
    }
  }, [router]);

  // Check authentication status
  const walletAddress = typeof window !== 'undefined' ? localStorage.getItem('walletAddress') : null;
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

  if (!walletAddress || !user) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
