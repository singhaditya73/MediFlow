/**
 * Client-side helper for PDF to FHIR conversion
 * Uploads PDF to server API for processing
 */

export interface ConversionResult {
  success: boolean;
  recordId?: string;
  fhirData?: unknown;
  extractedText?: string;
  error?: string;
}

/**
 * Upload PDF file and convert to FHIR format
 * @param file PDF file to convert
 * @returns Conversion result with FHIR data
 */
export async function convertPdfToFhir(
  file: File
): Promise<ConversionResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to convert PDF",
      };
    }

    return {
      success: true,
      recordId: data.recordId,
      fhirData: data.fhirData,
      extractedText: data.extractedText,
    };
  } catch (error) {
    return {
      success: false,
      error: "Network error occurred",
    };
  }
}

/**
 * Convert text/clinical data to FHIR format
 * @param text Clinical data text
 * @returns Conversion result with FHIR data
 */
export async function convertTextToFhir(
  text: string
): Promise<ConversionResult> {
  try {
    const response = await fetch("/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to convert text",
      };
    }

    return {
      success: true,
      recordId: data.recordId,
      fhirData: data.fhirData,
    };
  } catch (error) {
    return {
      success: false,
      error: "Network error occurred",
    };
  }
}
