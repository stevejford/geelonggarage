import { action, query, ActionCtx, QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";
import { DocumentType, PdfGenerationResult, TemplateData } from "./types";
import { getQuoteData, getInvoiceData, getWorkOrderData } from "./dataFetchers";
import { callPdfService, updateDocumentWithPdf } from "./service";

/**
 * Generate a PDF for a document
 *
 * This action calls the Render PDF service to generate a PDF for the specified document.
 * It then stores the PDF in Convex storage and updates the document with the PDF storage ID.
 *
 * See docs/pdf.md for the full implementation details.
 */
export const generatePdf = action({
  args: {
    type: v.string(),
    id: v.union(v.id("quotes"), v.id("invoices"), v.id("workOrders")),
  },
  handler: async (ctx: ActionCtx, args): Promise<PdfGenerationResult> => {
    try {
      // Get document data based on type
      let documentData: TemplateData | null = null;
      let templateName: string;

      // Get document data based on type
      switch (args.type as DocumentType) {
        case "quote":
          documentData = await getQuoteData(ctx.db, args.id as Id<"quotes">);
          templateName = "quote_template";
          break;
        case "invoice":
          documentData = await getInvoiceData(ctx.db, args.id as Id<"invoices">);
          templateName = "invoice_template";
          break;
        case "workOrder":
          documentData = await getWorkOrderData(ctx.db, args.id as Id<"workOrders">);
          templateName = "work_order_template";
          break;
        default:
          throw new ConvexError(`Unsupported document type: ${args.type}`);
      }

      if (!documentData) {
        throw new ConvexError(`Document not found: ${args.id}`);
      }

      // Call the PDF service to generate the PDF
      const pdfBlob = await callPdfService(templateName, documentData);

      // Store the PDF in Convex storage
      const storageId = await ctx.storage.store(pdfBlob);

      // Update the document with the PDF storage ID
      await updateDocumentWithPdf(ctx.db, args.type as DocumentType, args.id, storageId);

      // Generate the PDF URL
      const pdfUrl = await ctx.runQuery("pdf:getPdfUrl", {
        type: args.type,
        id: args.id,
      });

      return {
        success: true,
        message: "PDF generated successfully",
        storageId,
        url: pdfUrl
      };
    } catch (error) {
      console.error("PDF generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});

/**
 * Get the PDF URL for a document
 *
 * This query returns the URL for the PDF of the specified document.
 * If the PDF doesn't exist, it returns null.
 */
export const getPdfUrl = query({
  args: {
    type: v.string(),
    id: v.union(v.id("quotes"), v.id("invoices"), v.id("workOrders")),
  },
  handler: async (ctx: QueryCtx, args): Promise<string | null> => {
    // Get the document to check if it has a PDF
    let document;

    switch (args.type as DocumentType) {
      case "quote":
        document = await ctx.db.get(args.id as Id<"quotes">);
        break;
      case "invoice":
        document = await ctx.db.get(args.id as Id<"invoices">);
        break;
      case "workOrder":
        document = await ctx.db.get(args.id as Id<"workOrders">);
        break;
      default:
        throw new ConvexError(`Unsupported document type: ${args.type}`);
    }

    if (!document || !document.pdfStorageId) {
      return null;
    }

    // Generate a URL for the PDF
    const url = await ctx.storage.getUrl(document.pdfStorageId as Id<"_storage">);

    return url;
  },
});

/**
 * Download a PDF
 *
 * This query returns the PDF data for a document.
 */
export const downloadPdf = query({
  args: {
    type: v.string(),
    id: v.union(v.id("quotes"), v.id("invoices"), v.id("workOrders")),
  },
  handler: async (ctx: QueryCtx, args): Promise<ArrayBuffer | null> => {
    // Get the document to check if it has a PDF
    let document;

    switch (args.type as DocumentType) {
      case "quote":
        document = await ctx.db.get(args.id as Id<"quotes">);
        break;
      case "invoice":
        document = await ctx.db.get(args.id as Id<"invoices">);
        break;
      case "workOrder":
        document = await ctx.db.get(args.id as Id<"workOrders">);
        break;
      default:
        throw new ConvexError(`Unsupported document type: ${args.type}`);
    }

    if (!document || !document.pdfStorageId) {
      return null;
    }

    // Get the PDF data from storage
    const pdfData = await ctx.storage.get(document.pdfStorageId as Id<"_storage">);
    return pdfData;
  },
});
