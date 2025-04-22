import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Get all leads with optional filtering
export const getLeads = query({
  args: {
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with a base query
    let leadsQuery = ctx.db.query("leads");

    // If both status and search are provided, prioritize search index (Convex does not support chaining both)
    if (args.search && args.search.trim() !== "") {
      // @ts-expect-error: "search_leads" and "searchQuery" may not be in schema types, but should exist in schema.
      leadsQuery = ctx.db.query("leads").withSearchIndex("search_leads" as any, q =>
        // @ts-expect-error: "searchQuery" may not be in schema types, but should exist in schema.
        q.search("searchQuery" as any, args.search as string)
      );
    } else if (typeof args.status === "string") {
      // @ts-expect-error: "by_status" may not be in schema types, but should exist in schema.
      leadsQuery = ctx.db.query("leads").withIndex("by_status" as any, q => q.eq("status", args.status as string));
    }

    // Apply sorting
    const sortBy = args.sortBy || "createdAt";
    const sortOrder = args.sortOrder || "desc";

    let leads = await leadsQuery.collect();

    // Sort the results
    leads = leads.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === "asc" ?
          aValue.localeCompare(bValue) :
          bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      leads = leads.slice(0, args.limit);
    }

    return leads;
  },
});

// Get a single lead by ID
export const getLead = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new lead
export const createLead = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const now = Date.now();

    const leadId = await ctx.db.insert("leads", {
      ...args,
      createdAt: now,
      updatedAt: now,
      createdBy: userId || undefined,
    });

    return leadId;
  },
});

// Update an existing lead
export const updateLead = mutation({
  args: {
    id: v.id("leads"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Check if lead exists
    const lead = await ctx.db.get(id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    // Update the lead
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a lead
export const deleteLead = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    // Check if lead exists
    const lead = await ctx.db.get(args.id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Internal mutation to create a lead from a WordPress inquiry
export const createLeadFromInquiry = internalMutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    message: v.optional(v.string()),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const { name, email, phone, message, source } = args;

    const now = Date.now();

    const leadId = await ctx.db.insert("leads", {
      name,
      email,
      phone,
      notes: message,
      source,
      status: "New",
      createdAt: now,
      updatedAt: now,
    });

    return leadId;
  },
});

// Convert a lead to a contact
export const convertLeadToContact = mutation({
  args: {
    leadId: v.id("leads"),
    firstName: v.string(),
    lastName: v.string(),
    accountName: v.optional(v.string()),
    accountType: v.optional(v.string()),
    accountAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { leadId, firstName, lastName, accountName, accountType, accountAddress } = args;

    // Get the lead
    const lead = await ctx.db.get(leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    const userId = await getAuthUserId(ctx);
    const now = Date.now();

    // Create a new contact
    const contactId = await ctx.db.insert("contacts", {
      firstName,
      lastName,
      email: lead.email,
      phone: lead.phone,
      notes: lead.notes,
      createdAt: now,
      updatedAt: now,
      createdBy: userId || undefined,
    });

    let accountId: Id<"accounts"> | undefined;

    // Create an account if details provided
    if (accountName && accountAddress) {
      accountId = await ctx.db.insert("accounts", {
        name: accountName,
        type: accountType || "Residential",
        address: accountAddress,
        createdAt: now,
        updatedAt: now,
        createdBy: userId || undefined,
      });

      // Link contact to account
      await ctx.db.insert("contactAccounts", {
        contactId,
        accountId,
        isPrimary: true,
        createdAt: now,
      });
    }

    // Update lead status to Converted
    await ctx.db.patch(leadId, {
      status: "Converted",
      updatedAt: now,
    });

    return { contactId, accountId };
  },
});
