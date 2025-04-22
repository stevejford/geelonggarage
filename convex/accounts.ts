import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { formatAddress } from "./utils/formatters";
import { stringSimilarity } from "./utils/stringSimilarity";

// Search accounts with advanced filtering
export const searchAccounts = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
    field: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with a base query
    let accountsQuery = ctx.db.query("accounts").withIndex("by_name").order("asc");

    // Get all accounts
    let accounts = await accountsQuery.collect();

    // Apply search filter if provided
    if (args.search && args.search.trim() !== "") {
      const searchTerm = args.search.trim().toLowerCase();

      // Get contacts for each account
      const accountsWithContacts = await Promise.all(
        accounts.map(async (account) => {
          // Get associated contacts
          const contactAccounts = await ctx.db
            .query("contactAccounts")
            .withIndex("by_account", (q) => q.eq("accountId", account._id))
            .collect();

          if (contactAccounts.length === 0) {
            return { account, contacts: [] };
          }

          const contactIds = contactAccounts.map((ca) => ca.contactId);
          const contacts = await Promise.all(
            contactIds.map(async (id) => {
              const contact = await ctx.db.get(id);
              return contact;
            })
          );

          return {
            account,
            contacts: contacts.filter(Boolean),
          };
        })
      );

      // Filter based on search term and field
      accounts = accountsWithContacts
        .filter(({ account, contacts }) => {
          // If type filter is applied and doesn't match, exclude
          if (args.type && args.type !== 'all' && args.type !== 'accounts') {
            return false;
          }

          // Apply field-specific filtering if specified
          if (args.field && args.field !== 'any') {
            switch (args.field) {
              case 'name':
                return account.name.toLowerCase().includes(searchTerm);
              case 'type':
                return account.type.toLowerCase().includes(searchTerm);
              case 'address':
                const addressStr = formatAddress(
                  account.address || '',
                  account.city,
                  account.state,
                  account.zip
                ).toLowerCase();
                return addressStr.includes(searchTerm);
              default:
                return false;
            }
          }

          // Search across all fields
          // Account fields
          if (account.name.toLowerCase().includes(searchTerm)) return true;
          if (account.type.toLowerCase().includes(searchTerm)) return true;
          if (account.notes?.toLowerCase().includes(searchTerm)) return true;

          // Address fields
          if (account.address?.toLowerCase().includes(searchTerm)) return true;
          if (account.city?.toLowerCase().includes(searchTerm)) return true;
          if (account.state?.toLowerCase().includes(searchTerm)) return true;
          if (account.zip?.toLowerCase().includes(searchTerm)) return true;

          // Contact fields
          for (const contact of contacts) {
            if (contact) {
              const contactName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
              if (contactName.includes(searchTerm)) return true;
            }
          }

          return false;
        })
        .map(({ account }) => account);
    }

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      accounts = accounts.slice(0, args.limit);
    }

    return accounts;
  },
});

// Check for duplicate accounts
export const checkDuplicateAccounts = query({
  args: {
    name: v.string(),
    placeId: v.optional(v.string()),
    address: v.optional(v.string()),
    excludeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { name, placeId, address, excludeId } = args;
    let duplicates = [];

    // Exact match on Google Place ID (most reliable)
    if (placeId) {
      const exactPlaceMatches = await ctx.db
        .query("accounts")
        .withIndex("by_placeId", q => q.eq("placeId", placeId))
        .collect();

      // Filter out the current account if we're editing
      duplicates = exactPlaceMatches.filter(account =>
        !excludeId || account._id.toString() !== excludeId
      );

      if (duplicates.length > 0) {
        return duplicates;
      }
    }

    // Fuzzy name matching
    const nameMatches = await ctx.db
      .query("accounts")
      .withIndex("by_name")
      .collect();

    // Filter for similar names using fuzzy matching
    const fuzzyNameMatches = nameMatches.filter(account => {
      // Skip if this is the account we're editing
      if (excludeId && account._id.toString() === excludeId) {
        return false;
      }

      // Simple case-insensitive comparison
      const similarity = stringSimilarity(
        account.name.toLowerCase(),
        name.toLowerCase()
      );
      return similarity > 0.8; // 80% similarity threshold
    });

    if (fuzzyNameMatches.length > 0) {
      return fuzzyNameMatches;
    }

    // Address similarity if no exact place match
    if (address) {
      const allAccounts = await ctx.db.query("accounts").collect();

      const addressMatches = allAccounts.filter(account => {
        // Skip if this is the account we're editing
        if (excludeId && account._id.toString() === excludeId) {
          return false;
        }

        if (!account.address) return false;

        // Compare address components
        const addressSimilarity = stringSimilarity(
          account.address.toLowerCase(),
          address.toLowerCase()
        );
        return addressSimilarity > 0.7; // 70% similarity threshold
      });

      if (addressMatches.length > 0) {
        return addressMatches;
      }
    }

    return [];
  },
});

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

    // We'll apply search filtering after fetching the data

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

      if (sortOrder === "asc") {
        orderedQuery = accountsQuery.withIndex(indexName, q => q);
      } else {
        // Descending order not supported, fallback to ascending
        orderedQuery = accountsQuery.withIndex(indexName, q => q);
      }
    } else {
      orderedQuery = accountsQuery;
    }

    // Fetch all accounts
    let accounts = await orderedQuery.collect();

    // Apply search filter if provided
    if (args.search && args.search.trim() !== "") {
      const searchTerm = args.search.trim().toLowerCase();
      accounts = accounts.filter(account => {
        // Search in account fields
        if (account.name.toLowerCase().includes(searchTerm)) return true;
        if (account.type.toLowerCase().includes(searchTerm)) return true;
        if (account.address.toLowerCase().includes(searchTerm)) return true;
        if (account.city?.toLowerCase().includes(searchTerm)) return true;
        if (account.state?.toLowerCase().includes(searchTerm)) return true;
        if (account.zip?.toLowerCase().includes(searchTerm)) return true;
        if (account.notes?.toLowerCase().includes(searchTerm)) return true;
        return false;
      });
    }

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      accounts = accounts.slice(0, args.limit);
    }

    return accounts;
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
    unit: v.optional(v.string()),
    address: v.string(),
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
    // Business details
    businessCategory: v.optional(v.string()),
    website: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    openingHours: v.optional(v.array(v.string())),
    businessStatus: v.optional(v.string()),
    // Support both old and new photo data structures during transition
    photoCount: v.optional(v.number()),
    photoMetadata: v.optional(v.array(v.object({
      width: v.number(),
      height: v.number(),
      attribution: v.optional(v.string()),
      index: v.number(),
    }))),
    // Keep the old structure temporarily for backward compatibility
    photoReferences: v.optional(v.array(v.object({
      reference: v.string(),
      width: v.number(),
      height: v.number(),
      attribution: v.optional(v.string()),
    }))),
    // Franchise fields
    isFranchise: v.optional(v.boolean()),
    parentAccountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();

    // Convert parentAccountId to an ID if provided
    let parentAccountId = undefined;
    if (args.parentAccountId) {
      parentAccountId = args.parentAccountId as any;
    }

    const accountId = await ctx.db.insert("accounts", {
      ...args,
      parentAccountId,
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
    unit: v.optional(v.string()),
    address: v.optional(v.string()),
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
    // Business details
    businessCategory: v.optional(v.string()),
    website: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    openingHours: v.optional(v.array(v.string())),
    businessStatus: v.optional(v.string()),
    photoCount: v.optional(v.number()),
    photoMetadata: v.optional(v.array(v.object({
      width: v.number(),
      height: v.number(),
      attribution: v.optional(v.string()),
      index: v.number(),
    }))),
    // Keep the old structure temporarily for backward compatibility
    photoReferences: v.optional(v.array(v.object({
      reference: v.string(),
      width: v.number(),
      height: v.number(),
      attribution: v.optional(v.string()),
    }))),
    // Franchise fields
    isFranchise: v.optional(v.boolean()),
    parentAccountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, parentAccountId, ...updates } = args;

    // Check if account exists
    const account = await ctx.db.get(id);
    if (!account) {
      throw new Error("Account not found");
    }

    // Convert parentAccountId to an ID if provided
    let parentId = undefined;
    if (parentAccountId) {
      parentId = parentAccountId as any;
    }

    // Update the account
    await ctx.db.patch(id, {
      ...updates,
      parentAccountId: parentId,
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
