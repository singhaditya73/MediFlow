import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prismaClient } from "@/lib/db";

// GET - List all access controls for user's records
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
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
            email: true,
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
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { recordId, receiverEmail, accessLevel = "Read", expiresAt } = body;

    if (!recordId || !receiverEmail) {
      return NextResponse.json(
        { error: "Record ID and receiver email are required" },
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

    // Find receiver user
    const receiver = await prismaClient.user.findUnique({
      where: { email: receiverEmail },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver user not found" },
        { status: 404 }
      );
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
            email: true,
            name: true,
          },
        },
      },
    });

    // Create audit log
    await prismaClient.auditLog.create({
      data: {
        userId: user.id,
        recordId: recordId,
        action: "grant_access",
        metadata: {
          receiverId: receiver.id,
          receiverEmail: receiverEmail,
          accessLevel: accessLevel,
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
