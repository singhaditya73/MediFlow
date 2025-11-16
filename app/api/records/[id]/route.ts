import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prismaClient } from "@/lib/db";

// GET - Get a specific FHIR record
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const recordId = params.id;

    // Check if user owns the record OR has access to it
    const record = await prismaClient.fhirRecord.findFirst({
      where: {
        id: recordId,
        OR: [
          { userId: user.id }, // User owns it
          {
            // User has been granted access
            accessControls: {
              some: {
                receiverId: user.id,
                isActive: true,
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gte: new Date() } },
                ],
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Record not found or access denied" },
        { status: 404 }
      );
    }

    // Create audit log for viewing
    await prismaClient.auditLog.create({
      data: {
        userId: user.id,
        recordId: recordId,
        action: "view",
        metadata: {
          resourceType: record.resourceType,
        },
      },
    });

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (error) {
    console.error("Error fetching record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update a FHIR record
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const recordId = params.id;
    const body = await req.json();
    const { ipfsHash, blockchainTxHash, metadata } = body;

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

    // Update record
    const updatedRecord = await prismaClient.fhirRecord.update({
      where: { id: recordId },
      data: {
        ...(ipfsHash && { ipfsHash }),
        ...(blockchainTxHash && { blockchainTxHash }),
        ...(metadata && {
          metadata: { ...(record.metadata as object), ...metadata },
        }),
      },
    });

    // Create audit log
    await prismaClient.auditLog.create({
      data: {
        userId: user.id,
        recordId: recordId,
        action: "update",
        metadata: {
          changes: { ipfsHash, blockchainTxHash, metadata },
        },
      },
    });

    return NextResponse.json({
      success: true,
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
