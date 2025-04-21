import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireAdmin } from "./auth";

// Get general settings
export const getGeneralSettings = query({
  args: {},
  handler: async (ctx) => {
    // Check if user is admin
    await requireAdmin(ctx);

    // Get settings
    const settings = await ctx.db
      .query("settings")
      .filter(q => q.eq(q.field("type"), "general"))
      .first();

    return settings || {
      appName: "Service Pro",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      timezone: "America/New_York",
      enableNotifications: true,
      language: "en",
    };
  },
});

// Update general settings
export const updateGeneralSettings = mutation({
  args: {
    appName: v.string(),
    dateFormat: v.string(),
    timeFormat: v.string(),
    timezone: v.string(),
    enableNotifications: v.boolean(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    await requireAdmin(ctx);

    // Check if settings exist
    const existingSettings = await ctx.db
      .query("settings")
      .filter(q => q.eq(q.field("type"), "general"))
      .first();

    if (existingSettings) {
      // Update existing settings
      return await ctx.db.patch(existingSettings._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      // Create new settings
      return await ctx.db.insert("settings", {
        type: "general",
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get company settings
export const getCompanySettings = query({
  args: {},
  handler: async (ctx) => {
    // No admin check needed for company settings - all authenticated users can view

    // Get settings
    const settings = await ctx.db
      .query("settings")
      .filter(q => q.eq(q.field("type"), "company"))
      .first();

    return settings || {
      companyName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "US",
      phone: "",
      email: "",
      website: "",
      taxId: "",
      logoUrl: "",
    };
  },
});

// Update company settings
export const updateCompanySettings = mutation({
  args: {
    companyName: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    taxId: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    await requireAdmin(ctx);

    // Check if settings exist
    const existingSettings = await ctx.db
      .query("settings")
      .filter(q => q.eq(q.field("type"), "company"))
      .first();

    if (existingSettings) {
      // Update existing settings
      return await ctx.db.patch(existingSettings._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      // Create new settings
      return await ctx.db.insert("settings", {
        type: "company",
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get integration settings
export const getIntegrationSettings = query({
  args: {},
  handler: async (ctx) => {
    // Check if user is admin
    await requireAdmin(ctx);

    // Get settings
    const settings = await ctx.db
      .query("settings")
      .filter(q => q.eq(q.field("type"), "integrations"))
      .first();

    return settings || {
      stripe: { enabled: false, apiKey: "" },
      mailchimp: { enabled: false, apiKey: "" },
      googleCalendar: { enabled: false, apiKey: "" },
      slack: { enabled: false, webhookUrl: "" },
      quickbooks: { enabled: false, apiKey: "" },
      mcp: { enabled: false, servers: [] }
    };
  },
});

// Update integration settings
export const updateIntegrationSettings = mutation({
  args: {
    integration: v.string(),
    settings: v.any(),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    await requireAdmin(ctx);

    // Check if settings exist
    const existingSettings = await ctx.db
      .query("settings")
      .filter(q => q.eq(q.field("type"), "integrations"))
      .first();

    if (existingSettings) {
      // Update existing settings
      const updatedSettings = {
        ...existingSettings,
        [args.integration]: args.settings,
        updatedAt: Date.now(),
      };

      return await ctx.db.patch(existingSettings._id, updatedSettings);
    } else {
      // Create new settings
      const initialSettings = {
        stripe: { enabled: false, apiKey: "" },
        mailchimp: { enabled: false, apiKey: "" },
        googleCalendar: { enabled: false, apiKey: "" },
        slack: { enabled: false, webhookUrl: "" },
        quickbooks: { enabled: false, apiKey: "" },
        mcp: { enabled: false, servers: [] }
      };

      return await ctx.db.insert("settings", {
        type: "integrations",
        ...initialSettings,
        [args.integration]: args.settings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get roles
export const getRoles = query({
  args: {},
  handler: async (ctx) => {
    // Check if user is admin
    await requireAdmin(ctx);

    // Get roles
    const roles = await ctx.db
      .query("roles")
      .collect();

    // If no roles exist, return default system roles
    if (roles.length === 0) {
      return [
        {
          id: "admin",
          name: "Admin",
          description: "Full access to all features",
          permissions: ["*"],
          isSystem: true,
        },
        {
          id: "manager",
          name: "Manager",
          description: "Access to most features except settings",
          permissions: [
            "leads:read", "leads:write",
            "contacts:read", "contacts:write",
            "accounts:read", "accounts:write",
            "quotes:read", "quotes:write",
            "workOrders:read", "workOrders:write",
            "invoices:read", "invoices:write",
          ],
          isSystem: true,
        },
        {
          id: "technician",
          name: "Technician",
          description: "Access to work orders and limited customer information",
          permissions: [
            "contacts:read",
            "accounts:read",
            "workOrders:read", "workOrders:write",
          ],
          isSystem: true,
        },
        {
          id: "user",
          name: "User",
          description: "Basic access with limited permissions",
          permissions: [
            "leads:read",
            "contacts:read",
            "accounts:read",
            "quotes:read",
            "workOrders:read",
            "invoices:read",
          ],
          isSystem: true,
        },
      ];
    }

    return roles;
  },
});

// Create role
export const createRole = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    await requireAdmin(ctx);

    // Create role
    return await ctx.db.insert("roles", {
      name: args.name,
      description: args.description,
      permissions: args.permissions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update role
export const updateRole = mutation({
  args: {
    id: v.id("roles"),
    name: v.string(),
    description: v.string(),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    await requireAdmin(ctx);

    // Update role
    return await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      permissions: args.permissions,
      updatedAt: Date.now(),
    });
  },
});

// Delete role
export const deleteRole = mutation({
  args: {
    id: v.id("roles"),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    await requireAdmin(ctx);

    // Delete role
    return await ctx.db.delete(args.id);
  },
});

// Get permissions
export const getPermissions = query({
  args: {},
  handler: async (ctx) => {
    // Check if user is admin
    await requireAdmin(ctx);

    // Get permissions
    const permissions = await ctx.db
      .query("permissions")
      .collect();

    // If no permissions exist, return default permissions
    if (permissions.length === 0) {
      return [
        // Leads permissions
        {
          id: "leads:read",
          name: "View Leads",
          description: "View lead information",
          module: "Leads",
        },
        {
          id: "leads:write",
          name: "Manage Leads",
          description: "Create, edit, and delete leads",
          module: "Leads",
        },

        // Contacts permissions
        {
          id: "contacts:read",
          name: "View Contacts",
          description: "View contact information",
          module: "Contacts",
        },
        {
          id: "contacts:write",
          name: "Manage Contacts",
          description: "Create, edit, and delete contacts",
          module: "Contacts",
        },

        // Accounts permissions
        {
          id: "accounts:read",
          name: "View Accounts",
          description: "View account information",
          module: "Accounts",
        },
        {
          id: "accounts:write",
          name: "Manage Accounts",
          description: "Create, edit, and delete accounts",
          module: "Accounts",
        },

        // Quotes permissions
        {
          id: "quotes:read",
          name: "View Quotes",
          description: "View quote information",
          module: "Quotes",
        },
        {
          id: "quotes:write",
          name: "Manage Quotes",
          description: "Create, edit, and delete quotes",
          module: "Quotes",
        },

        // Work Orders permissions
        {
          id: "workOrders:read",
          name: "View Work Orders",
          description: "View work order information",
          module: "Work Orders",
        },
        {
          id: "workOrders:write",
          name: "Manage Work Orders",
          description: "Create, edit, and delete work orders",
          module: "Work Orders",
        },

        // Invoices permissions
        {
          id: "invoices:read",
          name: "View Invoices",
          description: "View invoice information",
          module: "Invoices",
        },
        {
          id: "invoices:write",
          name: "Manage Invoices",
          description: "Create, edit, and delete invoices",
          module: "Invoices",
        },

        // Settings permissions
        {
          id: "settings:read",
          name: "View Settings",
          description: "View application settings",
          module: "Settings",
        },
        {
          id: "settings:write",
          name: "Manage Settings",
          description: "Modify application settings",
          module: "Settings",
        },

        // User management permissions
        {
          id: "users:read",
          name: "View Users",
          description: "View user information",
          module: "Users",
        },
        {
          id: "users:write",
          name: "Manage Users",
          description: "Create, edit, and delete users",
          module: "Users",
        },
      ];
    }

    return permissions;
  },
});
