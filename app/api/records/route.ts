import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prismaClient } from "@/lib/db";

// GET - List all FHIR records for current user
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const resourceType = searchParams.get("resourceType") as
      | "DiagnosticReport"
      | "Patient"
      | "Observation"
      | "MedicationRequest"
      | "Condition"
      | "Procedure"
      | "AllergyIntolerance"
      | "Immunization"
      | "Other"
      | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query
    const where = {
      userId: user.id,
      ...(resourceType && { resourceType }),
    };

    // Get records
    const [records, total] = await Promise.all([
      prismaClient.fhirRecord.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          resourceType: true,
          fhirData: true,
          originalFileUrl: true,
          ipfsHash: true,
          blockchainTxHash: true,
          extractedText: false, // Don't return large text in list
          metadata: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prismaClient.fhirRecord.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a FHIR record
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("id");

    if (!recordId) {
      return NextResponse.json(
        { error: "Record ID is required" },
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

    // Delete record (cascades to access controls and audit logs)
    await prismaClient.fhirRecord.delete({
      where: { id: recordId },
    });

    // Create audit log
    await prismaClient.auditLog.create({
      data: {
        userId: user.id,
        action: "delete",
        metadata: {
          recordId: recordId,
          resourceType: record.resourceType,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
