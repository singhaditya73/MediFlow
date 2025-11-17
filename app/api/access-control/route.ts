import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prismaClient } from "@/lib/db";

// GET - List all access controls for user's records
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findFirst({
      where: { walletAddress: session.user.name }, // Using wallet address
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all access controls where user is the granter (owner)
    const accessControls = await prismaClient.accessControl.findMany({
      where: {
        granterId: user.id,
      },
      include: {
        receiver: {
          select: {
            id: true,
            walletAddress: true,
            name: true,
          },
        },
        record: {
          select: {
            id: true,
            resourceType: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      accessControls,
    });
  } catch (error) {
    console.error("Error fetching access controls:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Grant access to a record
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findFirst({
      where: { walletAddress: session.user.name },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { 
      recordId, 
      receiverAddress,
      receiverWalletAddress, 
      accessLevel = "read", 
      expiresAt,
      blockchainTxHash,
      ipfsHash,
      fileName
    } = body;

    // Support both receiverAddress and receiverWalletAddress for flexibility
    const receiverWallet = receiverAddress || receiverWalletAddress;

    if (!recordId || !receiverWallet) {
      return NextResponse.json(
        { error: "Record ID and receiver wallet address are required" },
        { status: 400 }
      );
    }

    // Verify user owns the record
    const record = await prismaClient.fhirRecord.findFirst({
      where: {
        id: recordId,
        userId: user.id,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Record not found or access denied" },
        { status: 404 }
      );
    }

    // Find receiver user by wallet address
    let receiver = await prismaClient.user.findFirst({
      where: { walletAddress: receiverWallet },
    });

    // If receiver doesn't exist in database, create placeholder entry
    if (!receiver) {
      receiver = await prismaClient.user.create({
        data: {
          walletAddress: receiverWallet,
          name: `User ${receiverWallet.slice(0, 6)}...${receiverWallet.slice(-4)}`,
          // User will be properly created when they first sign in
        },
      });
    }

    // Create or update access control
    const accessControl = await prismaClient.accessControl.upsert({
      where: {
        recordId_receiverId: {
          recordId: recordId,
          receiverId: receiver.id,
        },
      },
      update: {
        accessLevel: accessLevel,
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      create: {
        recordId: recordId,
        granterId: user.id,
        receiverId: receiver.id,
        accessLevel: accessLevel,
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        receiver: {
          select: {
            id: true,
            walletAddress: true,
            name: true,
          },
        },
      },
    });

    // Create audit log with blockchain reference
    await prismaClient.auditLog.create({
      data: {
        userId: user.id,
        recordId: recordId,
        action: "grant_access",
        blockchainTxHash: blockchainTxHash || null,
        metadata: {
          receiverId: receiver.id,
          receiverWalletAddress: receiverWallet,
          accessLevel: accessLevel,
          expiresAt: expiresAt || null,
          ipfsHash: ipfsHash || null,
          fileName: fileName || null,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      accessControl,
    });
  } catch (error) {
    console.error("Error granting access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
