import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { formatPhone, formatAddress } from "./utils/formatters";
import { stringSimilarity } from "./utils/stringSimilarity";
import { createMatchInfo } from "./utils/searchUtils";

// Search contacts with advanced filtering
export const searchContacts = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
    field: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with a base query
    let contactsQuery = ctx.db.query("contacts").withIndex("by_name").order("asc");

    // Get all contacts
    let contacts = await contactsQuery.collect();

    // Apply search filter if provided
    if (args.search && args.search.trim() !== "") {
      const searchTerm = args.search.trim().toLowerCase();

      // Get linked accounts for each contact
      const contactsWithAccounts = await Promise.all(
        contacts.map(async (contact) => {
          // Get associated accounts
          const contactAccounts = await ctx.db
            .query("contactAccounts")
            .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
            .collect();

          if (contactAccounts.length === 0) {
            return { contact, accounts: [] };
          }

          const accountIds = contactAccounts.map((ca) => ca.accountId);
          const accounts = await Promise.all(
            accountIds.map(async (id) => {
              const account = await ctx.db.get(id);
              return account;
            })
          );

          return {
            contact,
            accounts: accounts.filter(Boolean),
          };
        })
      );

      // Filter based on search term and field
      const contactsWithMatches = contactsWithAccounts
        .map(({ contact, accounts }) => {
          // If type filter is applied and doesn't match, exclude
          if (args.type && args.type !== 'all' && args.type !== 'contacts') {
            return { contact, matchInfo: null };
          }

          let matchInfo = null;

          // Apply field-specific filtering if specified
          if (args.field && args.field !== 'any') {
            switch (args.field) {
              case 'name':
                const fullName = `${contact.firstName} ${contact.lastName}`;
                if (fullName.toLowerCase().includes(searchTerm)) {
                  matchInfo = createMatchInfo('Name', fullName, searchTerm);
                  return { contact, matchInfo };
                }
                if (contact.firstName.toLowerCase().includes(searchTerm)) {
                  matchInfo = createMatchInfo('First Name', contact.firstName, searchTerm);
                  return { contact, matchInfo };
                }
                if (contact.lastName.toLowerCase().includes(searchTerm)) {
                  matchInfo = createMatchInfo('Last Name', contact.lastName, searchTerm);
                  return { contact, matchInfo };
                }
                return { contact, matchInfo: null };
              case 'email':
                if (contact.email?.toLowerCase().includes(searchTerm)) {
                  matchInfo = createMatchInfo('Email', contact.email, searchTerm);
                  return { contact, matchInfo };
                }
                return { contact, matchInfo: null };
              case 'phone':
                if (contact.phone?.toLowerCase().includes(searchTerm)) {
                  matchInfo = createMatchInfo('Phone', contact.phone, searchTerm);
                  return { contact, matchInfo };
                }
                return { contact, matchInfo: null };
              case 'address':
                const addressStr = formatAddress(
                  contact.address || '',
                  contact.city,
                  contact.state,
                  contact.zip,
                  contact.country
                );
                if (addressStr.toLowerCase().includes(searchTerm)) {
                  matchInfo = createMatchInfo('Address', addressStr, searchTerm);
                  return { contact, matchInfo };
                }
                return { contact, matchInfo: null };
              default:
                return { contact, matchInfo: null };
            }
          }

          // Search across all fields
          // Contact fields
          const fullName = `${contact.firstName} ${contact.lastName}`;
          if (fullName.toLowerCase().includes(searchTerm)) {
            matchInfo = createMatchInfo('Name', fullName, searchTerm);
            return { contact, matchInfo };
          }
          if (contact.firstName.toLowerCase().includes(searchTerm)) {
            matchInfo = createMatchInfo('First Name', contact.firstName, searchTerm);
            return { contact, matchInfo };
          }
          if (contact.lastName.toLowerCase().includes(searchTerm)) {
            matchInfo = createMatchInfo('Last Name', contact.lastName, searchTerm);
            return { contact, matchInfo };
          }
          if (contact.email?.toLowerCase().includes(searchTerm)) {
            matchInfo = createMatchInfo('Email', contact.email, searchTerm);
            return { contact, matchInfo };
          }
          if (contact.phone?.toLowerCase().includes(searchTerm)) {
            matchInfo = createMatchInfo('Phone', contact.phone, searchTerm);
            return { contact, matchInfo };
          }
          if (contact.notes?.toLowerCase().includes(searchTerm)) {
            matchInfo = createMatchInfo('Notes', contact.notes, searchTerm);
            return { contact, matchInfo };
          }

          // Address fields
          if (contact.address?.toLowerCase().includes(searchTerm)) {
            matchInfo = createMatchInfo('Address', contact.address, searchTerm);
            return { contact, matchInfo };
          }
          if (contact.city?.toLowerCase().includes(searchTerm)) {
            matchInfo = createMatchInfo('City', contact.city, searchTerm);
            return { contact, matchInfo };
          }
          if (contact.state?.toLowerCase().includes(searchTerm)) {
            matchInfo = createMatchInfo('State', contact.state, searchTerm);
            return { contact, matchInfo };
          }
          if (contact.zip?.toLowerCase().includes(searchTerm)) {
            matchInfo = createMatchInfo('ZIP', contact.zip, searchTerm);
            return { contact, matchInfo };
          }

          // Account fields
          for (const account of accounts) {
            if (account && account.name.toLowerCase().includes(searchTerm)) {
              matchInfo = createMatchInfo('Account', account.name, searchTerm);
              return { contact, matchInfo };
            }
          }

          return { contact, matchInfo: null };
        })
        .filter(({ matchInfo }) => matchInfo !== null);

      // Extract contacts and add match info directly to the contact object
      contacts = contactsWithMatches.map(({ contact, matchInfo }) => {
        // Create a new object with the match info fields directly on the contact
        return {
          ...contact,
          matchField: matchInfo?.field || '',
          matchContext: matchInfo?.context || ''
        };
      });
    }

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      contacts = contacts.slice(0, args.limit);
    }

    return contacts;
  },
});

// Check for duplicate contacts
export const checkDuplicateContacts = query({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    placeId: v.optional(v.string()),
    address: v.optional(v.string()),
    excludeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { firstName, lastName, email, phone, placeId, address, excludeId } = args;
    let duplicates = [];

    // Check for exact email match (most reliable)
    if (email) {
      const emailMatches = await ctx.db
        .query("contacts")
        .filter((q) => q.eq(q.field("email"), email))
        .collect();

      // Filter out the current contact if we're editing
      duplicates = emailMatches.filter(contact =>
        !excludeId || contact._id.toString() !== excludeId
      );

      if (duplicates.length > 0) {
        return duplicates;
      }
    }

    // Check for exact phone match
    if (phone) {
      const phoneMatches = await ctx.db
        .query("contacts")
        .filter((q) => q.eq(q.field("phone"), phone))
        .collect();

      // Filter out the current contact if we're editing
      duplicates = phoneMatches.filter(contact =>
        !excludeId || contact._id.toString() !== excludeId
      );

      if (duplicates.length > 0) {
        return duplicates;
      }
    }

    // Exact match on Google Place ID
    if (placeId) {
      const exactPlaceMatches = await ctx.db
        .query("contacts")
        .withIndex("by_placeId", q => q.eq("placeId", placeId))
        .collect();

      // Filter out the current contact if we're editing
      duplicates = exactPlaceMatches.filter(contact =>
        !excludeId || contact._id.toString() !== excludeId
      );

      if (duplicates.length > 0) {
        return duplicates;
      }
    }

    // Fuzzy name matching
    const nameMatches = await ctx.db
      .query("contacts")
      .withIndex("by_name")
      .collect();

    // Filter for similar names using fuzzy matching
    const fuzzyNameMatches = nameMatches.filter(contact => {
      // Skip if this is the contact we're editing
      if (excludeId && contact._id.toString() === excludeId) {
        return false;
      }

      // Compare first and last names
      const firstNameSimilarity = stringSimilarity(
        contact.firstName.toLowerCase(),
        firstName.toLowerCase()
      );

      const lastNameSimilarity = stringSimilarity(
        contact.lastName.toLowerCase(),
        lastName.toLowerCase()
      );

      // Consider it a match if both first and last names are similar
      return firstNameSimilarity > 0.8 && lastNameSimilarity > 0.8;
    });

    if (fuzzyNameMatches.length > 0) {
      return fuzzyNameMatches;
    }

    // Address similarity if no exact place match
    if (address) {
      const allContacts = await ctx.db.query("contacts").collect();

      const addressMatches = allContacts.filter(contact => {
        // Skip if this is the contact we're editing
        if (excludeId && contact._id.toString() === excludeId) {
          return false;
        }

        if (!contact.address) return false;

        // Compare address components
        const addressSimilarity = stringSimilarity(
          contact.address.toLowerCase(),
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

// Get all contacts with optional filtering
export const getContacts = query({
  args: {
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Apply search filter after fetching the data

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

    // Apply search filter if provided
    if (args.search && args.search.trim() !== "") {
      const searchTerm = args.search.trim().toLowerCase();
      contacts = contacts.filter(contact => {
        // Search in contact fields
        if (`${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm)) return true;
        if (contact.firstName.toLowerCase().includes(searchTerm)) return true;
        if (contact.lastName.toLowerCase().includes(searchTerm)) return true;
        if (contact.email?.toLowerCase().includes(searchTerm)) return true;
        if (contact.phone?.toLowerCase().includes(searchTerm)) return true;
        if (contact.address?.toLowerCase().includes(searchTerm)) return true;
        if (contact.city?.toLowerCase().includes(searchTerm)) return true;
        if (contact.state?.toLowerCase().includes(searchTerm)) return true;
        if (contact.zip?.toLowerCase().includes(searchTerm)) return true;
        if (contact.country?.toLowerCase().includes(searchTerm)) return true;
        if (contact.notes?.toLowerCase().includes(searchTerm)) return true;
        return false;
      });
    }

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      contacts = contacts.slice(0, args.limit);
    }

    // Fetch linked accounts for each contact
    const contactsWithAccounts = await Promise.all(
      contacts.map(async (contact) => {
        // Get associated accounts
        const contactAccounts = await ctx.db
          .query("contactAccounts")
          .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
          .collect();

        if (contactAccounts.length === 0) {
          return contact;
        }

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
      })
    );

    return contactsWithAccounts;
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
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
    // Google Places fields
    placeId: v.optional(v.string()),
    formattedAddress: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
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
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
    // Google Places fields
    placeId: v.optional(v.string()),
    formattedAddress: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
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
