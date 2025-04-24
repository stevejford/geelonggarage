import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { generateQuoteNumber } from "./utils/numberGenerator";
import { Id } from "./_generated/dataModel";

// Get all quotes with optional filtering
export const getQuotes = query({
  args: {
    status: v.optional(v.string()),
    contactId: v.optional(v.id("contacts")),
    accountId: v.optional(v.id("accounts")),
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Sorting parameters always in scope
    const sortBy = args.sortBy || "createdAt";
    const sortOrder = args.sortOrder || "desc";

    let quotesQuery;

    // Determine if search is being performed
    const isSearching = !!(args.search && args.search.trim() !== "");

    if (isSearching) {
      // Use only the search index (no other filters or sorts)
      // Convex typegen may not recognize the search index, so we cast to any to suppress TS errors.
      quotesQuery = (ctx.db.query("quotes") as any)
        .withSearchIndex("search_quotes", (q: any) => q.search("quoteNumber", args.search!));
    } else if (args.status !== undefined && args.status !== null) {
      quotesQuery = ctx.db
        .query("quotes")
        .withIndex("by_status", q => q.eq("status", args.status!));
    } else if (args.contactId !== undefined && args.contactId !== null) {
      quotesQuery = ctx.db
        .query("quotes")
        .withIndex("by_contact", q => q.eq("contactId", args.contactId!));
    } else if (args.accountId !== undefined && args.accountId !== null) {
      quotesQuery = ctx.db
        .query("quotes")
        .withIndex("by_account", q => q.eq("accountId", args.accountId!));
    } else if (sortBy === "createdAt") {
      quotesQuery = ctx.db.query("quotes").withIndex("by_createdAt");
      if (sortOrder === "desc") {
        quotesQuery = quotesQuery.order("desc");
      } else {
        quotesQuery = quotesQuery.order("asc");
      }
    } else if (sortBy === "quoteNumber") {
      quotesQuery = ctx.db.query("quotes").withIndex("by_quoteNumber");
      if (sortOrder === "desc") {
        quotesQuery = quotesQuery.order("desc");
      } else {
        quotesQuery = quotesQuery.order("asc");
      }
    } else {
      // Fallback: no filter, no indexed sort
      quotesQuery = ctx.db.query("quotes");
    }

    let quotes = await quotesQuery.collect();

    // Sort the results if not using an index-based sort
    if (!isSearching && sortBy !== "createdAt" && sortBy !== "quoteNumber") {
      quotes = quotes.sort((a: Doc<"quotes">, b: Doc<"quotes">) => {
        const aValue = a[sortBy as keyof typeof a];
        const bValue = b[sortBy as keyof typeof b];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    } else if (!isSearching && ((sortOrder === "asc" && sortBy === "createdAt") ||
               (sortOrder === "desc" && sortBy === "quoteNumber"))) {
      // Reverse the results if needed based on the index order
      quotes = quotes.reverse();
    }

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      quotes = quotes.slice(0, args.limit);
    }

    // Fetch contact and account details for each quote
    const quotesWithDetails = await Promise.all(
      quotes.map(async (quote: Doc<"quotes">) => {
        const contact = await ctx.db.get(quote.contactId);
        const account = await ctx.db.get(quote.accountId);

        return {
          ...quote,
          contact,
          account,
        };
      })
    );

    return quotesWithDetails;
  },
});

// Get a single quote by ID
export const getQuote = query({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.id);

    if (!quote) {
      return null;
    }

    // Get line items
    const lineItems = await ctx.db
      .query("quoteLineItems")
      .withIndex("by_quote", (q) => q.eq("quoteId", args.id))
      .collect();

    // Get contact and account details
    const contact = await ctx.db.get(quote.contactId);
    const account = await ctx.db.get(quote.accountId);

    return {
      ...quote,
      lineItems: lineItems.sort((a, b) => a.sortOrder - b.sortOrder),
      contact,
      account,
    };
  },
});

// Create a new quote
export const createQuote = mutation({
  args: {
    contactId: v.id("contacts"),
    accountId: v.id("accounts"),
    issueDate: v.number(),
    expiryDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    lineItems: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { contactId, accountId, issueDate, expiryDate, notes, lineItems } = args;

    // Check if contact and account exist
    const contact = await ctx.db.get(contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    const account = await ctx.db.get(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    const userId = await getAuthUserId(ctx);
    const now = Date.now();

    // Generate quote number
    const quoteNumber = await generateQuoteNumber(ctx.db);

    // Calculate totals
    let subtotal = 0;
    const calculatedLineItems = lineItems.map((item, index) => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;

      return {
        ...item,
        total,
        sortOrder: index + 1,
      };
    });

    // Assuming a fixed tax rate of 10% for now
    const taxRate = 0.1;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Create the quote
    const quoteId = await ctx.db.insert("quotes", {
      quoteNumber,
      contactId,
      accountId,
      status: "Draft",
      issueDate,
      expiryDate,
      subtotal,
      tax,
      total,
      notes,
      createdAt: now,
      updatedAt: now,
      createdBy: userId || undefined,
    });

    // Create line items
    for (const item of calculatedLineItems) {
      await ctx.db.insert("quoteLineItems", {
        quoteId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        sortOrder: item.sortOrder,
      });
    }

    return quoteId;
  },
});

// Update an existing quote
export const updateQuote = mutation({
  args: {
    id: v.id("quotes"),
    contactId: v.optional(v.id("contacts")),
    accountId: v.optional(v.id("accounts")),
    status: v.optional(v.string()),
    issueDate: v.optional(v.number()),
    expiryDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Check if quote exists
    const quote = await ctx.db.get(id);
    if (!quote) {
      throw new Error("Quote not found");
    }

    // If changing contact or account, verify they exist
    if (updates.contactId) {
      const contact = await ctx.db.get(updates.contactId);
      if (!contact) {
        throw new Error("Contact not found");
      }
    }

    if (updates.accountId) {
      const account = await ctx.db.get(updates.accountId);
      if (!account) {
        throw new Error("Account not found");
      }
    }

    // Update the quote
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Update quote line items
export const updateQuoteLineItems = mutation({
  args: {
    quoteId: v.id("quotes"),
    lineItems: v.array(
      v.object({
        id: v.optional(v.id("quoteLineItems")),
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        sortOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { quoteId, lineItems } = args;

    // Check if quote exists
    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    // Get existing line items
    const existingLineItems = await ctx.db
      .query("quoteLineItems")
      .withIndex("by_quote", (q) => q.eq("quoteId", quoteId))
      .collect();

    // Create a map of existing line items by ID
    const existingLineItemsMap = new Map(
      existingLineItems.map((item) => [item._id.toString(), item])
    );

    // Calculate totals and prepare updates
    let subtotal = 0;

    // Process each line item
    for (const item of lineItems) {
      const total = item.quantity * item.unitPrice;
      subtotal += total;

      if (item.id) {
        // Update existing line item
        await ctx.db.patch(item.id, {
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total,
          sortOrder: item.sortOrder,
        });

        // Remove from map to track which ones to delete
        existingLineItemsMap.delete(item.id.toString());
      } else {
        // Create new line item
        await ctx.db.insert("quoteLineItems", {
          quoteId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total,
          sortOrder: item.sortOrder,
        });
      }
    }

    // Delete line items that were not included in the update
    for (const [, item] of existingLineItemsMap) {
      await ctx.db.delete(item._id);
    }

    // Assuming a fixed tax rate of 10% for now
    const taxRate = 0.1;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Update quote totals
    await ctx.db.patch(quoteId, {
      subtotal,
      tax,
      total,
      updatedAt: Date.now(),
    });

    return quoteId;
  },
});

// Delete a quote
export const deleteQuote = mutation({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    // Check if quote exists
    const quote = await ctx.db.get(args.id);
    if (!quote) {
      throw new Error("Quote not found");
    }

    // Delete line items
    const lineItems = await ctx.db
      .query("quoteLineItems")
      .withIndex("by_quote", (q) => q.eq("quoteId", args.id))
      .collect();

    for (const item of lineItems) {
      await ctx.db.delete(item._id);
    }

    // Delete the quote
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Search quotes for global search
export const searchQuotes = query({
  args: {
    search: v.string(),
    type: v.optional(v.string()),
    field: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { search, type, field, limit } = args;

    if (!search || search.trim().length < 2) {
      return [];
    }

    const searchTerm = search.trim().toLowerCase();
    const maxResults = limit || 10;

    // Get all quotes
    const quotes = await ctx.db.query("quotes").collect();

    // Filter based on search term and field
    const filteredQuotes = quotes.filter(quote => {
      // If field is specified, only search in that field
      if (field && field !== 'any') {
        switch (field) {
          case 'number':
            return quote.quoteNumber?.toLowerCase().includes(searchTerm);
          case 'amount':
            return quote.total?.toString().includes(searchTerm);
          case 'status':
            return quote.status?.toLowerCase().includes(searchTerm);
          case 'date':
            // Try to match against formatted dates
            const issueDate = new Date(quote.issueDate).toLocaleDateString();
            const expiryDate = quote.expiryDate ? new Date(quote.expiryDate).toLocaleDateString() : '';
            return issueDate.includes(searchTerm) || expiryDate.includes(searchTerm);
          default:
            return false;
        }
      }

      // Search across all relevant fields
      return (
        quote.quoteNumber?.toLowerCase().includes(searchTerm) ||
        quote.status?.toLowerCase().includes(searchTerm) ||
        quote.notes?.toLowerCase().includes(searchTerm) ||
        quote.total?.toString().includes(searchTerm)
      );
    });

    // Limit results
    const limitedResults = filteredQuotes.slice(0, maxResults);

    // Fetch contact and account details for each quote
    const resultsWithDetails = await Promise.all(
      limitedResults.map(async (quote) => {
        const contact = quote.contactId ? await ctx.db.get(quote.contactId) : null;

        return {
          ...quote,
          contactName: contact ? `${contact.firstName} ${contact.lastName}` : '',
          matchField: 'quote',
          matchContext: `Quote #${quote.quoteNumber}`,
        };
      })
    );

    return resultsWithDetails;
  },
});

// Change quote status
export const changeQuoteStatus = mutation({
  args: {
    id: v.id("quotes"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, status } = args;

    // Check if quote exists
    const quote = await ctx.db.get(id);
    if (!quote) {
      throw new Error("Quote not found");
    }

    // Validate status transition
    const validStatuses = ["Draft", "Presented", "Accepted", "Declined"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    // Update the quote status
    await ctx.db.patch(id, {
      status,
      updatedAt: Date.now(),
    });

    return id;
  },
});
