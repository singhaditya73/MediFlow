import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text input is required" },
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
          Analyze the text and create appropriate FHIR resources such as Patient, DiagnosticReport, Observation, MedicationRequest, Condition, Procedure, etc.
          Return ONLY valid JSON without any markdown formatting or code blocks.
          The response should be a FHIR Bundle resource containing all relevant resources.
          Ensure all required fields are present and properly formatted according to FHIR R4 specifications.`,
        },
        {
          role: "user",
          content: `Convert this clinical data to FHIR format:\n\n${text}`,
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
        { error: "Failed to parse FHIR response from AI" },
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
        extractedText: text,
        metadata: {
          source: "text_input",
          inputLength: text.length,
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
          source: "text_conversion",
        },
      },
    });

    return NextResponse.json({
      success: true,
      recordId: fhirRecord.id,
      fhirData: fhirData,
    });
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
