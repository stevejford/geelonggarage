"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from 'resend';

// Get the Resend API key from environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_RchKUyzV_Fyhkb89U61ePe746UTAVrzua';
const resend = new Resend(RESEND_API_KEY);

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    documentType: v.optional(v.string()),
    documentId: v.optional(v.string()),
    message: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    sentBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const data = await resend.emails.send({
        from: 'Geelong Garage <admin@geelonggaragedoors.com.au>',
        to: args.to,
        subject: args.subject,
        html: args.html,
      });

      // Record email in history if document info is provided
      if (args.documentType && args.documentId) {
        // We can't directly call mutations from actions, so we'll return success
        // and let the client handle recording the email history
        return {
          success: true,
          data,
          documentInfo: {
            documentType: args.documentType,
            documentId: args.documentId,
            recipientEmail: args.to,
            subject: args.subject,
            message: args.message || "",
            pdfUrl: args.pdfUrl,
            sentAt: Date.now(),
            sentBy: args.sentBy,
            status: "sent"
          }
        };
      }

      return { success: true, data };
    } catch (error) {
      // Record failed email attempt if document info is provided
      if (args.documentType && args.documentId) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Return error info for client to handle
        return {
          success: false,
          error,
          documentInfo: {
            documentType: args.documentType,
            documentId: args.documentId,
            recipientEmail: args.to,
            subject: args.subject,
            message: args.message || "",
            pdfUrl: args.pdfUrl,
            sentAt: Date.now(),
            sentBy: args.sentBy,
            status: "failed",
            errorMessage: errorMessage
          }
        };
      }

      return { success: false, error };
    }
  },
});
