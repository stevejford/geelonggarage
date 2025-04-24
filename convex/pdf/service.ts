import { ConvexError } from "convex/values";
import { DatabaseWriter, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { DocumentType, PdfGenerationResult, TemplateData } from "./types";

// PDF Service URL (replace with your actual Render URL when deployed)
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || "http://localhost:3001";
const PDF_SERVICE_API_KEY = process.env.PDF_SERVICE_API_KEY || "your-secret-api-key";

// Call the PDF service to generate a PDF
export async function callPdfService(
  templateName: string,
  templateData: TemplateData
): Promise<Blob> {
  try {
    // Call the PDF service to generate the PDF
    const response = await fetch(`${PDF_SERVICE_URL}/api/pdf/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PDF_SERVICE_API_KEY}`
      },
      body: JSON.stringify({
        templateName,
        templateData,
        options: {
          format: "A4",
          margin: {
            top: "10mm",
            right: "10mm",
            bottom: "10mm",
            left: "10mm"
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ConvexError(`PDF service error: ${response.status} ${errorText}`);
    }

    // Get the PDF as a blob
    const pdfBlob = await response.blob();
    return pdfBlob;
  } catch (error) {
    console.error("Error calling PDF service:", error);
    throw error;
  }
}

// Update document with PDF storage ID
export async function updateDocumentWithPdf(
  db: DatabaseWriter,
  type: DocumentType,
  id: Id<any>,
  storageId: Id<"_storage">
): Promise<void> {
  const now = Date.now();

  switch (type) {
    case "quote":
      await db.patch(id as Id<"quotes">, {
        pdfStorageId: storageId,
        pdfGeneratedAt: now,
        updatedAt: now,
      });
      break;
    case "invoice":
      await db.patch(id as Id<"invoices">, {
        pdfStorageId: storageId,
        pdfGeneratedAt: now,
        updatedAt: now,
      });
      break;
    case "workOrder":
      await db.patch(id as Id<"workOrders">, {
        pdfStorageId: storageId,
        pdfGeneratedAt: now,
        updatedAt: now,
      });
      break;
    default:
      throw new ConvexError(`Unsupported document type: ${type as string}`);
  }
}
