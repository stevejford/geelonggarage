import { action, query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { DocumentType, PdfGenerationResult } from "./types";
import { callPdfService, updateDocumentWithPdf } from "./service";
import { getInvoiceData, getQuoteData, getWorkOrderData } from "./dataFetchers";

// Internal mutation to update document with PDF storage ID
export const updateDocumentPdf = mutation({
  args: {
    type: v.string(),
    id: v.any(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const { type, id, storageId } = args;
    await updateDocumentWithPdf(ctx.db, type as DocumentType, id, storageId);
  },
});

// Generate a PDF for a document
export const generatePdf = action({
  args: {
    type: v.string(),
    id: v.any(), // Using v.any() since we don't know which table the ID belongs to
  },
  handler: async (ctx, args) => {
    try {
      const { type, id } = args;
      const documentType = type as DocumentType;

      // Get the document data
      let templateName: string;
      let templateData: any;

      // Get the document data based on type
      switch (documentType) {
        case "invoice":
          templateName = "invoice";
          // Use a separate query to get the invoice data
          templateData = await ctx.runQuery(async ({ db }) => {
            return await getInvoiceData(db, id as Id<"invoices">);
          });
          break;
        case "quote":
          templateName = "quote";
          // Use a separate query to get the quote data
          templateData = await ctx.runQuery(async ({ db }) => {
            return await getQuoteData(db, id as Id<"quotes">);
          });
          break;
        case "workOrder":
          templateName = "workOrder";
          // Use a separate query to get the work order data
          templateData = await ctx.runQuery(async ({ db }) => {
            return await getWorkOrderData(db, id as Id<"workOrders">);
          });
          break;
        default:
          throw new Error(`Unsupported document type: ${type}`);
      }

      if (!templateData) {
        throw new Error(`Document not found: ${documentType} ${id}`);
      }

      // Generate the PDF
      const pdfBlob = await callPdfService(templateName, templateData);

      // Store the PDF in Convex storage
      const storageId = await ctx.storage.store(pdfBlob);

      // Update the document with the PDF storage ID
      await ctx.runMutation("pdf:updateDocumentPdf", {
        type: documentType,
        id,
        storageId,
      });

      return {
        success: true,
        message: `PDF generated successfully for ${documentType} ${id}`,
        storageId,
      } as PdfGenerationResult;
    } catch (error) {
      console.error("Error generating PDF:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      } as PdfGenerationResult;
    }
  },
});

// Get the URL for a PDF
export const getPdfUrl = query({
  args: {
    type: v.string(),
    id: v.any(), // Using v.any() since we don't know which table the ID belongs to
  },
  handler: async (ctx, args) => {
    const { type, id } = args;
    const documentType = type as DocumentType;

    // Get the document
    let document: any;
    switch (documentType) {
      case "invoice":
        document = await ctx.db.get(id as Id<"invoices">);
        break;
      case "quote":
        document = await ctx.db.get(id as Id<"quotes">);
        break;
      case "workOrder":
        document = await ctx.db.get(id as Id<"workOrders">);
        break;
      default:
        throw new Error(`Unsupported document type: ${type}`);
    }

    // Check if the document has a PDF
    if (!document || !document.pdfStorageId) {
      return null;
    }

    // Get the URL for the PDF
    const url = await ctx.storage.getUrl(document.pdfStorageId);
    return url;
  },
});
