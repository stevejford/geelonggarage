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

      // For now, we'll simulate a successful PDF generation
      // In the real implementation, we would get document data from the database

      // Simulate document data
      documentData = {
        company_name: "Geelong Garage",
        company_address_line1: "123 Main Street",
        company_address_line2: "Geelong, VIC 3220",
        company_phone: "(03) 5222 1234",
        company_email: "info@geelonggarage.com",
        company_bank_name: "Commonwealth Bank of Australia",
        company_account_name: "Geelong Garage Pty Ltd",
        company_bsb: "063-000",
        company_account_number: "12345678",
        logo_url: "https://via.placeholder.com/150",

        // Quote-specific fields (will be ignored for other document types)
        quote_number: "Q-12345",
        quote_date: "Jan 1, 2023",
        expiry_date: "Jan 31, 2023",

        // Customer info
        customer_name: "John Doe",
        customer_address_line1: "456 Customer St",
        customer_address_line2: "Melbourne, VIC 3000",
        customer_phone: "(03) 9876 5432",
        customer_email: "john@example.com",

        // Status
        status: "Draft",
        status_class: "draft",

        // Line items
        line_items: [
          {
            quantity: 1,
            description: "Sample Item",
            unit_price: "100.00",
            total: "100.00"
          }
        ],

        // Totals
        subtotal: "100.00",
        tax: "10.00",
        total: "110.00",

        // Notes
        notes: "This is a sample document.",
        generated_date: "Jan 1, 2023"
      } as TemplateData;

      templateName = `${args.type}_template`;

      if (!documentData) {
        throw new ConvexError(`Document not found: ${args.id}`);
      }

      // For now, we'll simulate a successful PDF generation
      // In the real implementation, this will call the PDF service

      // Simulate a delay for PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In the real implementation, we would:
      // 1. Call the PDF service
      // 2. Store the PDF in Convex storage
      // 3. Update the document with the PDF storage ID

      /*
      // Uncomment this code when the PDF service is ready

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
      */

      return {
        success: true,
        message: "PDF generation simulated. See docs/pdf.md for implementation plan.",
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

    // For now, we'll return a placeholder
    // In the real implementation, we would get the PDF data from storage
    return new ArrayBuffer(0);
  },
});
