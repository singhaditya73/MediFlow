"use client";

import type React from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Later call your signup API here
    // Example:
    // const response = await fetch("/api/signup", {
    //   method: "POST",
    //   body: JSON.stringify({ email, password, name }),
    // });

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/" });
  };

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
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>Sign up to access MediFlow&apos;s healthcare data standardization platform</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Normal Signup Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    required
                    className="transition-all border-muted-foreground/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="transition-all border-muted-foreground/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    required
                    className="transition-all border-muted-foreground/20 focus:border-primary"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full transition-all hover:shadow-md hover:shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>

              {/* OR separator */}
              <div className="flex items-center space-x-2 py-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>

              {/* Google Sign Up Button */}
              <Button
                variant="outline"
                className="w-full group relative overflow-hidden transition-all hover:shadow-md hover:shadow-primary/10 hover:border-primary/50"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <div className="absolute inset-0 w-0 bg-gradient-to-r from-primary/10 to-primary/5 transition-all group-hover:w-full"></div>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </CardContent>

            {/* Footer */}
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                  Log in
                </Link>
              </div>
              <div className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our{" "}
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
