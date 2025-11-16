import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prismaClient } from "@/lib/db";

// PATCH - Update access control (toggle active status, update expiry, etc.)
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

    const body = await req.json();
    const { isActive, accessLevel, expiresAt } = body;
    const accessId = params.id;

    // Verify user owns the access control
    const existingAccess = await prismaClient.accessControl.findFirst({
      where: {
        id: accessId,
        granterId: user.id,
      },
    });

    if (!existingAccess) {
      return NextResponse.json(
        { error: "Access control not found or access denied" },
        { status: 404 }
      );
    }

    // Update access control
    const updatedAccess = await prismaClient.accessControl.update({
      where: { id: accessId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(accessLevel && { accessLevel }),
        ...(expiresAt !== undefined && {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
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
        recordId: existingAccess.recordId,
        action: isActive ? "grant_access" : "revoke_access",
        metadata: {
          accessId: accessId,
          receiverId: existingAccess.receiverId,
          changes: { isActive, accessLevel, expiresAt },
        },
      },
    });

    return NextResponse.json({
      success: true,
      accessControl: updatedAccess,
    });
  } catch (error) {
    console.error("Error updating access control:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove access control
export async function DELETE(
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

    const accessId = params.id;

    // Verify user owns the access control
    const existingAccess = await prismaClient.accessControl.findFirst({
      where: {
        id: accessId,
        granterId: user.id,
      },
    });

    if (!existingAccess) {
      return NextResponse.json(
        { error: "Access control not found or access denied" },
        { status: 404 }
      );
    }

    // Delete access control
    await prismaClient.accessControl.delete({
      where: { id: accessId },
    });

    // Create audit log
    await prismaClient.auditLog.create({
      data: {
        userId: user.id,
        recordId: existingAccess.recordId,
        action: "revoke_access",
        metadata: {
          accessId: accessId,
          receiverId: existingAccess.receiverId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Access control deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting access control:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
