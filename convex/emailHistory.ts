"use node";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get email history for a document
export const getEmailHistory = query({
  args: {
    documentType: v.string(),
    documentId: v.string(),
  },
  handler: async (ctx, args) => {
    const { documentType, documentId } = args;
    
    const history = await ctx.db
      .query("emailHistory")
      .withIndex("by_document", (q) => 
        q.eq("documentType", documentType).eq("documentId", documentId)
      )
      .order("desc", (q) => q.field("sentAt"))
      .collect();
    
    return history;
  },
});

// Get recent email history
export const getRecentEmailHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const history = await ctx.db
      .query("emailHistory")
      .withIndex("by_sentAt")
      .order("desc")
      .take(limit);
    
    return history;
  },
});

// Get email history for a recipient
export const getEmailHistoryByRecipient = query({
  args: {
    recipientEmail: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { recipientEmail, limit = 10 } = args;
    
    const history = await ctx.db
      .query("emailHistory")
      .withIndex("by_recipient")
      .eq("recipientEmail", recipientEmail)
      .order("desc", (q) => q.field("sentAt"))
      .take(limit);
    
    return history;
  },
});
