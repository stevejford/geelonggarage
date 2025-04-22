import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { stringSimilarity } from "./utils/stringSimilarity";
import { formatAddress } from "./utils/formatters";

// Check for duplicate leads
export const checkDuplicateLeads = query({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    placeId: v.optional(v.string()),
    address: v.optional(v.string()),
    excludeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { name, email, phone, placeId, address, excludeId } = args;
    let duplicates = [];

    // Check for exact email match (most reliable)
    if (email) {
      const emailMatches = await ctx.db
        .query("leads")
        .filter((q) => q.eq(q.field("email"), email))
        .collect();

      // Filter out the current lead if we're editing
      duplicates = emailMatches.filter(lead =>
        !excludeId || lead._id.toString() !== excludeId
      );

      if (duplicates.length > 0) {
        return duplicates;
      }
    }

    // Check for exact phone match
    if (phone) {
      const phoneMatches = await ctx.db
        .query("leads")
        .filter((q) => q.eq(q.field("phone"), phone))
        .collect();

      // Filter out the current lead if we're editing
      duplicates = phoneMatches.filter(lead =>
        !excludeId || lead._id.toString() !== excludeId
      );

      if (duplicates.length > 0) {
        return duplicates;
      }
    }

    // Exact match on Google Place ID
    if (placeId) {
      const exactPlaceMatches = await ctx.db
        .query("leads")
        .withIndex("by_placeId", q => q.eq("placeId", placeId))
        .collect();

      // Filter out the current lead if we're editing
      duplicates = exactPlaceMatches.filter(lead =>
        !excludeId || lead._id.toString() !== excludeId
      );

      if (duplicates.length > 0) {
        return duplicates;
      }
    }

    // Fuzzy name matching
    const nameMatches = await ctx.db
      .query("leads")
      .collect();

    // Filter for similar names using fuzzy matching
    const fuzzyNameMatches = nameMatches.filter(lead => {
      // Skip if this is the lead we're editing
      if (excludeId && lead._id.toString() === excludeId) {
        return false;
      }

      // Compare names
      const nameSimilarity = stringSimilarity(
        lead.name.toLowerCase(),
        name.toLowerCase()
      );

      return nameSimilarity > 0.8; // 80% similarity threshold
    });

    if (fuzzyNameMatches.length > 0) {
      return fuzzyNameMatches;
    }

    // Address similarity if no exact place match
    if (address) {
      const allLeads = await ctx.db.query("leads").collect();

      const addressMatches = allLeads.filter(lead => {
        // Skip if this is the lead we're editing
        if (excludeId && lead._id.toString() === excludeId) {
          return false;
        }

        if (!lead.address) return false;

        // Compare address components
        const addressSimilarity = stringSimilarity(
          lead.address.toLowerCase(),
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

// Search leads with advanced filtering
export const searchLeads = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.string()),
    field: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with a base query
    let leadsQuery = ctx.db.query("leads").withIndex("by_createdAt").order("desc");

    // Get all leads
    let leads = await leadsQuery.collect();

    // Apply search filter if provided
    if (args.search && args.search.trim() !== "") {
      const searchTerm = args.search.trim().toLowerCase();

      // Filter based on search term and field
      leads = leads.filter(lead => {
        // If type filter is applied and doesn't match, exclude
        if (args.type && args.type !== 'all' && args.type !== 'leads') {
          return false;
        }

        // Apply field-specific filtering if specified
        if (args.field && args.field !== 'any') {
          switch (args.field) {
            case 'name':
              return lead.name.toLowerCase().includes(searchTerm);
            case 'source':
              return lead.source?.toLowerCase().includes(searchTerm) || false;
            case 'status':
              return lead.status.toLowerCase().includes(searchTerm);
            default:
              return false;
          }
        }

        // Search across all fields
        if (lead.name.toLowerCase().includes(searchTerm)) return true;
        if (lead.email?.toLowerCase().includes(searchTerm)) return true;
        if (lead.phone?.toLowerCase().includes(searchTerm)) return true;
        if (lead.source?.toLowerCase().includes(searchTerm)) return true;
        if (lead.status.toLowerCase().includes(searchTerm)) return true;
        if (lead.notes?.toLowerCase().includes(searchTerm)) return true;

        return false;
      });
    }

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      leads = leads.slice(0, args.limit);
    }

    return leads;
  },
});

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
    let leadsQuery = ctx.db.query("leads").withIndex("by_createdAt");

    // Apply status filter if provided
    if (typeof args.status === "string" && args.status.trim() !== "") {
      const status = args.status.trim();
      leadsQuery = ctx.db.query("leads").withIndex("by_status", q => q.eq("status", status));
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

    // Apply search filter if provided
    if (args.search && args.search.trim() !== "") {
      const searchTerm = args.search.trim().toLowerCase();
      leads = leads.filter(lead => {
        // Search in lead fields
        if (lead.name.toLowerCase().includes(searchTerm)) return true;
        if (lead.email?.toLowerCase().includes(searchTerm)) return true;
        if (lead.phone?.toLowerCase().includes(searchTerm)) return true;
        if (lead.source?.toLowerCase().includes(searchTerm)) return true;
        if (lead.status.toLowerCase().includes(searchTerm)) return true;
        if (lead.notes?.toLowerCase().includes(searchTerm)) return true;
        return false;
      });
    }

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
    // Address fields
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    // Google Places fields
    placeId: v.optional(v.string()),
    formattedAddress: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
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
    // Address fields
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    // Google Places fields
    placeId: v.optional(v.string()),
    formattedAddress: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
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
    // Address fields (optional for inquiries)
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    // Google Places fields
    placeId: v.optional(v.string()),
    formattedAddress: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { name, email, phone, message, source, address, city, state, zip, placeId, formattedAddress, latitude, longitude } = args;

    const now = Date.now();

    const leadId = await ctx.db.insert("leads", {
      name,
      email,
      phone,
      notes: message,
      source,
      address,
      city,
      state,
      zip,
      placeId,
      formattedAddress,
      latitude,
      longitude,
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
    // Contact address fields
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postcode: v.optional(v.string()), // Using zip field for postcode
    country: v.optional(v.string()),
    placeId: v.optional(v.string()),
    formattedAddress: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    // Account fields
    accountName: v.optional(v.string()),
    accountType: v.optional(v.string()),
    accountAddress: v.optional(v.string()),
    accountCity: v.optional(v.string()),
    accountState: v.optional(v.string()),
    accountPostcode: v.optional(v.string()), // Using zip field for postcode
    accountCountry: v.optional(v.string()),
    accountPlaceId: v.optional(v.string()),
    accountFormattedAddress: v.optional(v.string()),
    accountLatitude: v.optional(v.number()),
    accountLongitude: v.optional(v.number()),
    // We don't need business details for leads
    // Franchise fields
    isFranchise: v.optional(v.boolean()),
    parentAccountId: v.optional(v.id("accounts")),
  },
  handler: async (ctx, args) => {
    const {
      leadId, firstName, lastName,
      address, city, state, postcode, country, placeId, formattedAddress, latitude, longitude,
      accountName, accountType, accountAddress, accountCity, accountState, accountPostcode, accountCountry,
      accountPlaceId, accountFormattedAddress, accountLatitude, accountLongitude,
      // Business fields removed
      isFranchise, parentAccountId
    } = args;

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
      // Address fields
      address,
      city,
      state,
      zip: postcode, // Store postcode in zip field for backward compatibility
      country,
      placeId,
      formattedAddress,
      latitude,
      longitude,
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
        // Address fields
        address: accountAddress,
        city: accountCity,
        state: accountState,
        zip: accountPostcode, // Store postcode in zip field for backward compatibility
        country: accountCountry,
        placeId: accountPlaceId,
        formattedAddress: accountFormattedAddress,
        latitude: accountLatitude,
        longitude: accountLongitude,
        // Business details
        // Business fields removed
        // Franchise fields
        isFranchise,
        parentAccountId,
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
