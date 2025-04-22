import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { generateQuoteNumber } from "./utils/numberGenerator";
import { Id } from "./_generated/dataModel";
import { formatDate } from "./utils/formatters";

// Search quotes with advanced filtering
export const searchQuotes = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
    field: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with a base query
    let quotesQuery = ctx.db.query("quotes").order("desc");

    // Get all quotes
    let quotes = await quotesQuery.collect();

    // Apply search filter if provided
    if (args.search && args.search.trim() !== "") {
      const searchTerm = args.search.trim().toLowerCase();

      // Get related entities for each quote
      const quotesWithDetails = await Promise.all(
        quotes.map(async (quote) => {
          const contact = quote.contactId ? await ctx.db.get(quote.contactId) : null;
          const account = quote.accountId ? await ctx.db.get(quote.accountId) : null;
          return { quote, contact, account };
        })
      );

      // Filter based on search term and field
      quotes = quotesWithDetails
        .filter(({ quote, contact, account }) => {
          // If type filter is applied and doesn't match, exclude
          if (args.type && args.type !== 'all' && args.type !== 'quotes') {
            return false;
          }

          // Apply field-specific filtering if specified
          if (args.field && args.field !== 'any') {
            switch (args.field) {
              case 'number':
                return quote.quoteNumber?.toLowerCase().includes(searchTerm);
              case 'amount':
                return quote.total.toString().includes(searchTerm);
              case 'name':
                if (contact) {
                  const contactName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
                  return contactName.includes(searchTerm);
                }
                if (account) {
                  return account.name.toLowerCase().includes(searchTerm);
                }
                return false;
              case 'date':
                const issueDateStr = formatDate(quote.issueDate).toLowerCase();
                const expiryDateStr = quote.expiryDate ? formatDate(quote.expiryDate).toLowerCase() : '';
                return issueDateStr.includes(searchTerm) || expiryDateStr.includes(searchTerm);
              case 'status':
                return quote.status.toLowerCase().includes(searchTerm);
              default:
                return false;
            }
          }

          // Search across all fields
          // Quote fields
          if (quote.quoteNumber?.toLowerCase().includes(searchTerm)) return true;
          if (quote.notes?.toLowerCase().includes(searchTerm)) return true;
          if (quote.total.toString().includes(searchTerm)) return true;
          if (quote.status.toLowerCase().includes(searchTerm)) return true;

          // Dates
          const issueDateStr = formatDate(quote.issueDate).toLowerCase();
          const expiryDateStr = quote.expiryDate ? formatDate(quote.expiryDate).toLowerCase() : '';
          if (issueDateStr.includes(searchTerm) || expiryDateStr.includes(searchTerm)) return true;

          // Contact fields
          if (contact) {
            const contactName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
            if (contactName.includes(searchTerm)) return true;
            if (contact.email?.toLowerCase().includes(searchTerm)) return true;
            if (contact.phone?.toLowerCase().includes(searchTerm)) return true;
          }

          // Account fields
          if (account) {
            if (account.name.toLowerCase().includes(searchTerm)) return true;
            if (account.address?.toLowerCase().includes(searchTerm)) return true;
            if (account.city?.toLowerCase().includes(searchTerm)) return true;
            if (account.state?.toLowerCase().includes(searchTerm)) return true;
            if (account.zip?.toLowerCase().includes(searchTerm)) return true;
          }

          return false;
        })
        .map(({ quote }) => quote);
    }

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      quotes = quotes.slice(0, args.limit);
    }

    return quotes;
  },
});

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

    if (args.status !== undefined && args.status !== null) {
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

    // Apply search filter if provided
    if (isSearching) {
      const searchTerm = args.search!.trim().toLowerCase();

      // First, get all the quotes
      const quotesWithDetails = await Promise.all(
        quotes.map(async (quote) => {
          const contact = await ctx.db.get(quote.contactId);
          const account = await ctx.db.get(quote.accountId);
          return { quote, contact, account };
        })
      );

      // Then filter based on all relevant fields
      quotes = quotesWithDetails
        .filter(({ quote, contact, account }) => {
          // Search in quote fields
          if (quote.quoteNumber.toLowerCase().includes(searchTerm)) return true;
          if (quote.notes?.toLowerCase().includes(searchTerm)) return true;

          // Format and check dates
          const issueDateStr = new Date(quote.issueDate).toLocaleDateString();
          if (issueDateStr.includes(searchTerm)) return true;

          // Format and check amounts
          const totalStr = quote.total.toString();
          if (totalStr.includes(searchTerm)) return true;

          // Check status
          if (quote.status.toLowerCase().includes(searchTerm)) return true;

          // Search in contact fields
          if (contact) {
            const contactName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
            if (contactName.includes(searchTerm)) return true;
            if (contact.email?.toLowerCase().includes(searchTerm)) return true;
            if (contact.phone?.toLowerCase().includes(searchTerm)) return true;
          }

          // Search in account fields
          if (account) {
            if (account.name.toLowerCase().includes(searchTerm)) return true;
            if (account.address.toLowerCase().includes(searchTerm)) return true;
            if (account.city?.toLowerCase().includes(searchTerm)) return true;
            if (account.state?.toLowerCase().includes(searchTerm)) return true;
            if (account.zip?.toLowerCase().includes(searchTerm)) return true;
          }

          return false;
        })
        .map(({ quote }) => quote);
    }

    // Sort the results if not using an index-based sort
    if (sortBy !== "createdAt" && sortBy !== "quoteNumber") {
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
    } else if ((sortOrder === "asc" && sortBy === "createdAt") ||
               (sortOrder === "desc" && sortBy === "quoteNumber")) {
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
