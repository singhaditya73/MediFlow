import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/db';

/**
 * POST /api/auth/wallet
 * Authenticate or register user with wallet signature
 */
export async function POST(req: NextRequest) {
  try {
    const { walletAddress, signature, message, name } = await req.json();

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: 'Wallet address, signature, and message are required' },
        { status: 400 }
      );
    }

    // For now, we trust the signature was created by MetaMask
    // In production, you should verify the signature server-side
    // using a library like ethers.js or web3.js

    // Normalize wallet address to lowercase
    const normalizedAddress = walletAddress.toLowerCase();

    // Check if user exists
    let user = await prismaClient.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    // If user doesn't exist and name is provided, create new user
    if (!user && name) {
      user = await prismaClient.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          name,
        },
      });

      // Log the signup
      await prismaClient.auditLog.create({
        data: {
          userId: user.id,
          action: 'signup',
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          metadata: {
            walletAddress: walletAddress.toLowerCase(),
          },
        },
      });

      return NextResponse.json({
        user,
        isNewUser: true,
        message: 'Account created successfully',
      });
    }

    // If user exists, return user data
    if (user) {
      // Log the login
      await prismaClient.auditLog.create({
        data: {
          userId: user.id,
          action: 'login',
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          metadata: {
            walletAddress: walletAddress.toLowerCase(),
          },
        },
      });

      return NextResponse.json({
        user,
        isNewUser: false,
        message: 'Login successful',
      });
    }

    // User doesn't exist and no name provided (need to register)
    return NextResponse.json(
      { 
        error: 'User not found. Please provide a name to register.',
        needsRegistration: true,
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('Wallet auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
