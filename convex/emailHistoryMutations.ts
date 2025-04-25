import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Internal mutation to record email history
export const recordEmailHistory = internalMutation({
  args: {
    documentType: v.string(),
    documentId: v.string(),
    recipientEmail: v.string(),
    subject: v.string(),
    message: v.string(),
    pdfUrl: v.optional(v.string()),
    sentAt: v.number(),
    sentBy: v.optional(v.string()),
    status: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Add to email history
    await ctx.db.insert("emailHistory", {
      documentType: args.documentType,
      documentId: args.documentId,
      recipientEmail: args.recipientEmail,
      subject: args.subject,
      message: args.message,
      pdfUrl: args.pdfUrl,
      sentAt: args.sentAt,
      sentBy: args.sentBy,
      status: args.status,
      errorMessage: args.errorMessage,
    });
    
    // Update the document's lastSentAt field if it's an invoice and status is "sent"
    if (args.documentType === "invoice" && args.status === "sent") {
      await ctx.db.patch(args.documentId as Id<"invoices">, {
        lastSentAt: args.sentAt,
        updatedAt: args.sentAt,
      });
    }
  },
});
