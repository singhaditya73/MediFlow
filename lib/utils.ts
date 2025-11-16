import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format datetime to readable string
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

/**
 * Download JSON as file
 */
export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * API fetch helper with error handling
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "An error occurred" };
    }

    return { data };
  } catch {
    return { error: "Network error occurred" };
  }
}

/**
 * Upload file helper
 */
export async function uploadFile(
  file: File,
  endpoint: string
): Promise<{ data?: unknown; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Upload failed" };
    }

    return { data };
  } catch {
    return { error: "Network error occurred" };
  }
}

/**
 * Validate FHIR resource
 */
export function isValidFhirResource(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  return "resourceType" in data;
}

/**
 * Get FHIR resource display name
 */
export function getFhirResourceName(resourceType: string): string {
  const names: Record<string, string> = {
    DiagnosticReport: "Diagnostic Report",
    Patient: "Patient Record",
    Observation: "Observation",
    MedicationRequest: "Medication Request",
    Condition: "Condition",
    Procedure: "Procedure",
    AllergyIntolerance: "Allergy Intolerance",
    Immunization: "Immunization",
    Other: "Other Resource",
  };
  return names[resourceType] || resourceType;
}
