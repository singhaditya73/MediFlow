import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import pdfParse from "pdf-parse";
import OpenAI from "openai";
import { prismaClient } from "@/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    let extractedText = "";
    try {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } catch {
      return NextResponse.json(
        { error: "Failed to parse PDF file" },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text could be extracted from PDF" },
        { status: 400 }
      );
    }

    // Convert to FHIR using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a healthcare data specialist. Convert the given clinical data into valid FHIR R4 JSON format. 
          Analyze the text and create appropriate FHIR resources such as Patient, DiagnosticReport, Observation, MedicationRequest, etc.
          Return ONLY valid JSON without any markdown formatting or code blocks.
          The response should be a FHIR Bundle resource containing all relevant resources.`,
        },
        {
          role: "user",
          content: `Convert this clinical data to FHIR format:\n\n${extractedText}`,
        },
      ],
      temperature: 0.3,
    });

    const fhirContent = completion.choices[0].message?.content || "{}";
    
    // Parse FHIR JSON
    let fhirData;
    try {
      fhirData = JSON.parse(fhirContent);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse FHIR response" },
        { status: 500 }
      );
    }

    // Determine resource type
    const resourceType = fhirData.resourceType || "Other";

    // Save to database
    const fhirRecord = await prismaClient.fhirRecord.create({
      data: {
        userId: user.id,
        resourceType: resourceType,
        fhirData: fhirData,
        extractedText: extractedText,
        metadata: {
          originalFileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      },
    });

    // Create audit log
    await prismaClient.auditLog.create({
      data: {
        userId: user.id,
        recordId: fhirRecord.id,
        action: "create",
        metadata: {
          source: "pdf_upload",
          fileName: file.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      recordId: fhirRecord.id,
      fhirData: fhirData,
      extractedText: extractedText,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
