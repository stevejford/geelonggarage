import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all accounts with optional filtering
export const getAccounts = query({
  args: {
    type: v.optional(v.string()),
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with a base query
    let accountsQuery = ctx.db.query("accounts");

    // Apply type filter if provided
    if (args.type) {
      accountsQuery = accountsQuery.filter(q => q.eq(q.field("type"), args.type));
    }

    // NOTE: Search filtering with startsWith or contains is not supported on FilterBuilder
    // So we skip search filtering or implement a simple equality check if needed
    // For now, we skip search filtering due to API limitations

    // Determine sorting
    const sortBy = args.sortBy || "name";
    const sortOrder = args.sortOrder || "asc";

    // Allowed sort fields and corresponding index names
    // Must use literal types for withIndex
    type IndexName = "by_name" | "by_type" | "by_createdAt" | "by_createdBy";

    let orderedQuery;

    if (sortBy === "name" || sortBy === "type" || sortBy === "createdAt" || sortBy === "createdBy") {
      const indexName: IndexName =
        sortBy === "name" ? "by_name" :
        sortBy === "type" ? "by_type" :
        sortBy === "createdAt" ? "by_createdAt" :
        "by_createdBy";

      // Use the appropriate index for sorting
      orderedQuery = accountsQuery.withIndex(indexName, q => q);
    } else {
      // Default to sorting by name if no valid sort field is provided
      orderedQuery = accountsQuery.withIndex("by_name", q => q);
    }

    // Apply limit via collect
    const limit = args.limit && args.limit > 0 ? args.limit : 100;

    // Use collect() to get the actual array of accounts
    const accounts = await orderedQuery.collect();

    // Apply search filter if provided (since we can't do it in the query)
    let filteredAccounts = accounts;
    if (args.search && args.search.trim() !== "") {
      const searchTerm = args.search.trim().toLowerCase();
      filteredAccounts = accounts.filter(account =>
        account.name.toLowerCase().includes(searchTerm) ||
        (account.address && account.address.toLowerCase().includes(searchTerm)) ||
        (account.city && account.city.toLowerCase().includes(searchTerm)) ||
        (account.state && account.state.toLowerCase().includes(searchTerm)) ||
        (account.zip && account.zip.toLowerCase().includes(searchTerm))
      );
    }

    // Apply manual sorting for descending order if needed
    if (sortOrder === "desc") {
      filteredAccounts = [...filteredAccounts].reverse();
    }

    // Apply limit after filtering and sorting
    return filteredAccounts.slice(0, limit);
  },
});

// Get a single account by ID
export const getAccount = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.id);

    if (!account) {
      return null;
    }

    // Get associated contacts
    const contactAccounts = await ctx.db
      .query("contactAccounts")
      .withIndex("by_account", (q) => q.eq("accountId", args.id))
      .collect();

    const contactIds = contactAccounts.map((ca) => ca.contactId);
    const contacts = await Promise.all(
      contactIds.map((id) => ctx.db.get(id))
    );

    return {
      ...account,
      contacts: contacts.filter(Boolean).map((contact, index) => ({
        ...contact,
        relationship: contactAccounts[index].relationship,
        isPrimary: contactAccounts[index].isPrimary,
      })),
    };
  },
});

// Create a new account
export const createAccount = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    address: v.string(),
    unit: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
    // Google Places fields
    placeId: v.optional(v.string()),
    formattedAddress: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    businessCategory: v.optional(v.string()),
    businessStatus: v.optional(v.string()),
    isFranchise: v.optional(v.boolean()),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    openingHours: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const now = Date.now();

    const accountId = await ctx.db.insert("accounts", {
      ...args,
      createdAt: now,
      updatedAt: now,
      createdBy: userId || undefined,
    });

    return accountId;
  },
});

// Update an existing account
export const updateAccount = mutation({
  args: {
    id: v.id("accounts"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    address: v.optional(v.string()),
    unit: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
    // Google Places fields
    placeId: v.optional(v.string()),
    formattedAddress: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    businessCategory: v.optional(v.string()),
    businessStatus: v.optional(v.string()),
    isFranchise: v.optional(v.boolean()),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    openingHours: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Check if account exists
    const account = await ctx.db.get(id);
    if (!account) {
      throw new Error("Account not found");
    }

    // Update the account
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete an account
export const deleteAccount = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    // Check if account exists
    const account = await ctx.db.get(args.id);
    if (!account) {
      throw new Error("Account not found");
    }

    // Delete associated contact-account relationships
    const contactAccounts = await ctx.db
      .query("contactAccounts")
      .withIndex("by_account", (q) => q.eq("accountId", args.id))
      .collect();

    for (const ca of contactAccounts) {
      await ctx.db.delete(ca._id);
    }

    // Delete the account
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Link a contact to an account
export const linkContactToAccount = mutation({
  args: {
    contactId: v.id("contacts"),
    accountId: v.id("accounts"),
    relationship: v.optional(v.string()),
    isPrimary: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { contactId, accountId, relationship, isPrimary } = args;

    // Check if contact and account exist
    const contact = await ctx.db.get(contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    const account = await ctx.db.get(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Check if relationship already exists
    const existingLink = await ctx.db
      .query("contactAccounts")
      .withIndex("by_contact_account", (q) =>
        q.eq("contactId", contactId).eq("accountId", accountId)
      )
      .unique();

    if (existingLink) {
      throw new Error("Contact is already linked to this account");
    }

    // If this is a primary contact, update any existing primary contacts
    if (isPrimary) {
      const existingPrimary = await ctx.db
        .query("contactAccounts")
        .withIndex("by_account", (q) => q.eq("accountId", accountId))
        .filter((q) => q.eq(q.field("isPrimary"), true))
        .collect();

      for (const ep of existingPrimary) {
        await ctx.db.patch(ep._id, { isPrimary: false });
      }
    }

    // Create the link
    const linkId = await ctx.db.insert("contactAccounts", {
      contactId,
      accountId,
      relationship,
      isPrimary,
      createdAt: Date.now(),
    });

    return linkId;
  },
});

// Update a contact-account relationship
export const updateContactAccountLink = mutation({
  args: {
    contactId: v.id("contacts"),
    accountId: v.id("accounts"),
    relationship: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { contactId, accountId, relationship, isPrimary } = args;

    // Find the existing link
    const existingLink = await ctx.db
      .query("contactAccounts")
      .withIndex("by_contact_account", (q) =>
        q.eq("contactId", contactId).eq("accountId", accountId)
      )
      .unique();

    if (!existingLink) {
      throw new Error("Contact is not linked to this account");
    }

    const updates: any = {};

    if (relationship !== undefined) {
      updates.relationship = relationship;
    }

    if (isPrimary !== undefined) {
      updates.isPrimary = isPrimary;

      // If setting as primary, update any existing primary contacts
      if (isPrimary) {
        const existingPrimary = await ctx.db
          .query("contactAccounts")
          .withIndex("by_account", (q) => q.eq("accountId", accountId))
          .filter((q) =>
            q.and(
              q.eq(q.field("isPrimary"), true),
              q.neq(q.field("_id"), existingLink._id)
            )
          )
          .collect();

        for (const ep of existingPrimary) {
          await ctx.db.patch(ep._id, { isPrimary: false });
        }
      }
    }

    // Update the link
    await ctx.db.patch(existingLink._id, updates);

    return existingLink._id;
  },
});

// Remove a contact-account link
export const unlinkContactFromAccount = mutation({
  args: {
    contactId: v.id("contacts"),
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const { contactId, accountId } = args;

    // Find the existing link
    const existingLink = await ctx.db
      .query("contactAccounts")
      .withIndex("by_contact_account", (q) =>
        q.eq("contactId", contactId).eq("accountId", accountId)
      )
      .unique();

    if (!existingLink) {
      throw new Error("Contact is not linked to this account");
    }

    // Delete the link
    await ctx.db.delete(existingLink._id);

    return existingLink._id;
  },
});

// Search accounts for global search
export const searchAccounts = query({
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

    // Get all accounts
    const accounts = await ctx.db.query("accounts").collect();

    // Filter based on search term and field
    const filteredAccounts = accounts.filter(account => {
      // If field is specified, only search in that field
      if (field && field !== 'any') {
        switch (field) {
          case 'name':
            return account.name?.toLowerCase().includes(searchTerm);
          case 'address':
            return (
              account.address?.toLowerCase().includes(searchTerm) ||
              account.city?.toLowerCase().includes(searchTerm) ||
              account.state?.toLowerCase().includes(searchTerm) ||
              account.zip?.toLowerCase().includes(searchTerm)
            );
          case 'type':
            return account.type?.toLowerCase().includes(searchTerm);
          default:
            return false;
        }
      }

      // Search across all relevant fields
      return (
        account.name?.toLowerCase().includes(searchTerm) ||
        account.type?.toLowerCase().includes(searchTerm) ||
        account.address?.toLowerCase().includes(searchTerm) ||
        account.city?.toLowerCase().includes(searchTerm) ||
        account.state?.toLowerCase().includes(searchTerm) ||
        account.zip?.toLowerCase().includes(searchTerm) ||
        account.notes?.toLowerCase().includes(searchTerm) ||
        account.businessCategory?.toLowerCase().includes(searchTerm) ||
        account.phoneNumber?.toLowerCase().includes(searchTerm) ||
        account.email?.toLowerCase().includes(searchTerm) ||
        account.website?.toLowerCase().includes(searchTerm)
      );
    });

    // Limit results
    const limitedResults = filteredAccounts.slice(0, maxResults);

    return limitedResults.map(account => ({
      ...account,
      matchField: 'account',
      matchContext: account.name,
    }));
  },
});

// Check if an account with the same place ID or address already exists
export const checkDuplicateAccount = query({
  args: {
    placeId: v.optional(v.string()),
    formattedAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { placeId, formattedAddress } = args;

    // If we have a place ID, check for duplicates by place ID first
    if (placeId) {
      const existingByPlaceId = await ctx.db
        .query("accounts")
        .withIndex("by_placeId", (q) => q.eq("placeId", placeId))
        .first();

      if (existingByPlaceId) {
        return {
          isDuplicate: true,
          account: existingByPlaceId,
          matchType: "placeId"
        };
      }
    }

    // If we have a formatted address, check for duplicates by address
    if (formattedAddress) {
      // Since we can't query directly by formatted address (no index),
      // we'll need to get all accounts and filter
      const allAccounts = await ctx.db.query("accounts").collect();

      // Find accounts with matching formatted address
      const matchingAccounts = allAccounts.filter(account =>
        account.formattedAddress === formattedAddress
      );

      if (matchingAccounts.length > 0) {
        return {
          isDuplicate: true,
          account: matchingAccounts[0],
          matchType: "address"
        };
      }
    }

    // No duplicates found
    return {
      isDuplicate: false
    };
  },
});
