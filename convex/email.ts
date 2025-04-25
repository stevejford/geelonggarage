"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from 'resend';

const resend = new Resend('re_RchKUyzV_Fyhkb89U61ePe746UTAVrzua');

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
        await ctx.runMutation(async ({ db }) => {
          // Add to email history
          await db.insert("emailHistory", {
            documentType: args.documentType,
            documentId: args.documentId,
            recipientEmail: args.to,
            subject: args.subject,
            message: args.message || "",
            pdfUrl: args.pdfUrl,
            sentAt: Date.now(),
            sentBy: args.sentBy,
            status: "sent",
          });

          // Update the document's lastSentAt field if it's an invoice
          if (args.documentType === "invoice") {
            await db.patch(args.documentId as any, {
              lastSentAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        });
      }

      return { success: true, data };
    } catch (error) {
      // Record failed email attempt if document info is provided
      if (args.documentType && args.documentId) {
        await ctx.runMutation(async ({ db }) => {
          await db.insert("emailHistory", {
            documentType: args.documentType,
            documentId: args.documentId,
            recipientEmail: args.to,
            subject: args.subject,
            message: args.message || "",
            pdfUrl: args.pdfUrl,
            sentAt: Date.now(),
            sentBy: args.sentBy,
            status: "failed",
            errorMessage: error instanceof Error ? error.message : String(error),
          });
        });
      }

      return { success: false, error };
    }
  },
});
