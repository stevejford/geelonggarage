import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all contacts with optional filtering
export const getContacts = query({
  args: {
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // NOTE: Search filtering with contains or search is not supported without a search index.
    // The Convex schema does not define a search index for contacts.
    // If search is provided, we cannot filter by it.
    // To enable search, add a .searchIndex to the contacts table in convex/schema.ts.

    // Apply sorting
    const sortBy = args.sortBy || "lastName";
    const sortOrder = args.sortOrder || "asc";

    let contacts: any[] = [];
    if (sortBy === "lastName") {
      if (sortOrder === "asc") {
        contacts = await ctx.db.query("contacts").withIndex("by_name", q => q).order("asc").collect();
      } else {
        contacts = await ctx.db.query("contacts").withIndex("by_name", q => q).order("desc").collect();
      }
    } else if (sortBy === "createdAt") {
      if (sortOrder === "asc") {
        contacts = await ctx.db.query("contacts").withIndex("by_createdAt", q => q).order("asc").collect();
      } else {
        contacts = await ctx.db.query("contacts").withIndex("by_createdAt", q => q).order("desc").collect();
      }
    } else {
      contacts = await ctx.db.query("contacts").collect();
    }

    // Sort the results if not using an index-based sort
    if (sortBy !== "lastName" && sortBy !== "createdAt") {
      contacts = contacts.sort((a, b) => {
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
    } else if ((sortOrder === "desc" && sortBy === "lastName") ||
               (sortOrder === "asc" && sortBy === "createdAt")) {
      // Reverse the results if needed based on the index order
      contacts = contacts.reverse();
    }

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      contacts = contacts.slice(0, args.limit);
    }

    return contacts;
  },
});

// Get a single contact by ID
export const getContact = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);

    if (!contact) {
      return null;
    }

    // Get associated accounts
    const contactAccounts = await ctx.db
      .query("contactAccounts")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();

    const accountIds = contactAccounts.map((ca) => ca.accountId);
    const accounts = await Promise.all(
      accountIds.map((id) => ctx.db.get(id))
    );

    return {
      ...contact,
      accounts: accounts.filter(Boolean).map((account, index) => ({
        ...account,
        relationship: contactAccounts[index].relationship,
        isPrimary: contactAccounts[index].isPrimary,
      })),
    };
  },
});

// Create a new contact
export const createContact = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const now = Date.now();

    const contactId = await ctx.db.insert("contacts", {
      ...args,
      createdAt: now,
      updatedAt: now,
      createdBy: userId || undefined,
    });

    return contactId;
  },
});

// Update an existing contact
export const updateContact = mutation({
  args: {
    id: v.id("contacts"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Check if contact exists
    const contact = await ctx.db.get(id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Update the contact
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a contact
export const deleteContact = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    // Check if contact exists
    const contact = await ctx.db.get(args.id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // Delete associated contact-account relationships
    const contactAccounts = await ctx.db
      .query("contactAccounts")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();

    for (const ca of contactAccounts) {
      await ctx.db.delete(ca._id);
    }

    // Delete the contact
    await ctx.db.delete(args.id);
    return args.id;
  },
});
