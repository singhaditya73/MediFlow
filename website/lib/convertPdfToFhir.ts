import OpenAI from "openai";
import pdfParse from "pdf-parse";
import fs from "fs";

// Load environment variables
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OpenAI API key is missing. Please set it in the .env file.");
}

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: apiKey,
});

/**
 * Function to convert a PDF file to FHIR report using ChatGPT API
 * @param pdfPath Path to the PDF file
 */
async function convertPdfToFhir(pdfPath: string) {
  try {
    // Step 1: Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);

    // Step 2: Extract text from PDF
    const pdfText = pdfData.text;

    // Step 3: Use ChatGPT to convert text to FHIR
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a healthcare data assistant. Convert the given text into a valid FHIR JSON format.",
        },
        { role: "user", content: pdfText },
      ],
    });

    // Step 4: Get the FHIR JSON response
    const fhirReport = response.data.choices[0].message?.content;
    console.log("FHIR Report:", fhirReport);

    return fhirReport;
  } catch (error) {
    console.error("Error converting PDF to FHIR:", error);
    throw error;
  }
}

// Example usage
convertPdfToFhir("./example.pdf")
  .then((fhirReport) => {
    console.log("FHIR Report successfully generated:", fhirReport);
  })
  .catch((error) => {
    console.error("Failed to generate FHIR Report:", error);
  });