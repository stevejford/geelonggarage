import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { generateWorkOrderNumber } from "./utils/numberGenerator";

// Get all work orders with optional filtering
export const getWorkOrders = query({
  args: {
    status: v.optional(v.string()),
    contactId: v.optional(v.id("contacts")),
    accountId: v.optional(v.id("accounts")),
    technicianId: v.optional(v.string()),
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with a base query
    // Build the query in a single chain to avoid type errors
    const sortBy = args.sortBy || "createdAt";
    const sortOrder = args.sortOrder || "desc";

    let workOrdersQuery;

    if (typeof args.status === "string") {
      // Filter by status, then sort if needed
      if (sortBy === "createdAt") {
        workOrdersQuery = ctx.db
          .query("workOrders")
          .withIndex("by_status", q => q.eq("status", args.status as string))
          .order(sortOrder === "desc" ? "desc" : "asc");
      } else {
        workOrdersQuery = ctx.db
          .query("workOrders")
          .withIndex("by_status", q => q.eq("status", args.status as string));
      }
    } else if (typeof args.contactId !== "undefined") {
      if (sortBy === "createdAt") {
        workOrdersQuery = ctx.db
          .query("workOrders")
          .withIndex("by_contact", q => q.eq("contactId", args.contactId!))
          .order(sortOrder === "desc" ? "desc" : "asc");
      } else {
        workOrdersQuery = ctx.db
          .query("workOrders")
          .withIndex("by_contact", q => q.eq("contactId", args.contactId!));
      }
    } else if (typeof args.accountId !== "undefined") {
      if (sortBy === "createdAt") {
        workOrdersQuery = ctx.db
          .query("workOrders")
          .withIndex("by_account", q => q.eq("accountId", args.accountId!))
          .order(sortOrder === "desc" ? "desc" : "asc");
      } else {
        workOrdersQuery = ctx.db
          .query("workOrders")
          .withIndex("by_account", q => q.eq("accountId", args.accountId!));
      }
    } else if (sortBy === "createdAt") {
      workOrdersQuery = ctx.db
        .query("workOrders")
        .withIndex("by_createdAt")
        .order(sortOrder === "desc" ? "desc" : "asc");
    } else if (sortBy === "workOrderNumber") {
      workOrdersQuery = ctx.db
        .query("workOrders")
        .withIndex("by_workOrderNumber")
        .order(sortOrder === "desc" ? "desc" : "asc");
    } else if (sortBy === "scheduledDate") {
      workOrdersQuery = ctx.db
        .query("workOrders")
        .withIndex("by_scheduledDate")
        .order(sortOrder === "desc" ? "desc" : "asc");
    } else {
      workOrdersQuery = ctx.db.query("workOrders");
    }

    let workOrders = await workOrdersQuery.collect();

    // Apply search filter if provided (case-insensitive substring match on workOrderNumber)
    if (typeof args.search === "string" && args.search.trim() !== "") {
      const search = args.search.toLowerCase();
      workOrders = workOrders.filter((wo: { workOrderNumber: string }) =>
        wo.workOrderNumber.toLowerCase().includes(search)
      );
    }

    // Filter by technician if provided
    if (args.technicianId && typeof args.technicianId === 'string') {
      const assignments = await ctx.db
        .query("workOrderAssignments")
        .withIndex("by_technician", (q) => q.eq("technicianId", args.technicianId as string))
        .collect();

      const assignedWorkOrderIds = new Set(assignments.map((a) => a.workOrderId.toString()));
      workOrders = workOrders.filter((wo) => assignedWorkOrderIds.has(wo._id.toString()));
    }

    // Sort the results if not using an index-based sort
    if (sortBy !== "createdAt" && sortBy !== "workOrderNumber" && sortBy !== "scheduledDate") {
      workOrders = workOrders.sort((a, b) => {
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
    } else if ((sortOrder === "asc" && sortBy === "createdAt") ||
               (sortOrder === "desc" && sortBy === "workOrderNumber") ||
               (sortOrder === "desc" && sortBy === "scheduledDate")) {
      // Reverse the results if needed based on the index order
      workOrders = workOrders.reverse();
    }

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      workOrders = workOrders.slice(0, args.limit);
    }

    // Fetch contact, account, and technician details for each work order
    const workOrdersWithDetails = await Promise.all(
      workOrders.map(async (workOrder) => {
        const contact = await ctx.db.get(workOrder.contactId);
        const account = await ctx.db.get(workOrder.accountId);

        // Get technician assignments
        const assignments = await ctx.db
          .query("workOrderAssignments")
          .withIndex("by_workOrder", (q) => q.eq("workOrderId", workOrder._id))
          .collect();

        return {
          ...workOrder,
          contact,
          account,
          assignments,
        };
      })
    );

    return workOrdersWithDetails;
  },
});

// Get a single work order by ID
export const getWorkOrder = query({
  args: { id: v.id("workOrders") },
  handler: async (ctx, args) => {
    const workOrder = await ctx.db.get(args.id);

    if (!workOrder) {
      return null;
    }

    // Get contact and account details
    const contact = await ctx.db.get(workOrder.contactId);
    const account = await ctx.db.get(workOrder.accountId);

    // Get quote details if available
    let quote = null;
    if (workOrder.quoteId) {
      quote = await ctx.db.get(workOrder.quoteId);
    }

    // Get technician assignments
    const assignments = await ctx.db
      .query("workOrderAssignments")
      .withIndex("by_workOrder", (q) => q.eq("workOrderId", args.id))
      .collect();

    return {
      ...workOrder,
      contact,
      account,
      quote,
      assignments,
    };
  },
});

// Create a new work order
export const createWorkOrder = mutation({
  args: {
    contactId: v.id("contacts"),
    accountId: v.id("accounts"),
    quoteId: v.optional(v.id("quotes")),
    scheduledDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    technicianIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { contactId, accountId, quoteId, scheduledDate, notes, technicianIds } = args;

    // Check if contact and account exist
    const contact = await ctx.db.get(contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    const account = await ctx.db.get(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Check if quote exists if provided
    if (quoteId) {
      const quote = await ctx.db.get(quoteId);
      if (!quote) {
        throw new Error("Quote not found");
      }

      // Verify quote is accepted
      if (quote.status !== "Accepted") {
        throw new Error("Cannot create work order from a quote that is not accepted");
      }
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const now = Date.now();

    // Generate work order number
    const workOrderNumber = await generateWorkOrderNumber(ctx.db);

    // Create the work order
    const workOrderId = await ctx.db.insert("workOrders", {
      workOrderNumber,
      contactId,
      accountId,
      quoteId,
      status: "Pending",
      scheduledDate,
      notes,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    });

    // Assign technicians if provided
    if (technicianIds && technicianIds.length > 0) {
      for (const technicianId of technicianIds) {
        await ctx.db.insert("workOrderAssignments", {
          workOrderId,
          technicianId,
          assignedAt: now,
          assignedBy: userId,
        });
      }
    }

    // If created from a quote, update the quote status if not already accepted
    if (quoteId) {
      const quote = await ctx.db.get(quoteId);
      if (quote && quote.status !== "Accepted") {
        await ctx.db.patch(quoteId, {
          status: "Accepted",
          updatedAt: now,
        });
      }
    }

    return workOrderId;
  },
});

// Update an existing work order
export const updateWorkOrder = mutation({
  args: {
    id: v.id("workOrders"),
    contactId: v.optional(v.id("contacts")),
    accountId: v.optional(v.id("accounts")),
    status: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    completedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Check if work order exists
    const workOrder = await ctx.db.get(id);
    if (!workOrder) {
      throw new Error("Work order not found");
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

    // Validate status transition
    if (updates.status) {
      const validStatuses = ["Pending", "Scheduled", "In Progress", "Completed", "Cancelled"];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}`);
      }

      // If marking as completed, set completedDate if not provided
      if (updates.status === "Completed" && !updates.completedDate && !workOrder.completedDate) {
        updates.completedDate = Date.now();
      }
    }

    // Update the work order
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Assign technicians to a work order
export const assignTechnicians = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    technicianIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { workOrderId, technicianIds } = args;

    // Check if work order exists
    const workOrder = await ctx.db.get(workOrderId);
    if (!workOrder) {
      throw new Error("Work order not found");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const now = Date.now();

    // Get existing assignments
    const existingAssignments = await ctx.db
      .query("workOrderAssignments")
      .withIndex("by_workOrder", (q) => q.eq("workOrderId", workOrderId))
      .collect();

    // Create a set of existing technician IDs
    const existingTechnicianIds = new Set(
      existingAssignments.map((a) => a.technicianId)
    );

    // Add new assignments
    for (const technicianId of technicianIds) {
      if (!existingTechnicianIds.has(technicianId)) {
        await ctx.db.insert("workOrderAssignments", {
          workOrderId,
          technicianId,
          assignedAt: now,
          assignedBy: userId,
        });
      }
    }

    return workOrderId;
  },
});

// Remove technician assignments from a work order
export const removeTechnicians = mutation({
  args: {
    workOrderId: v.id("workOrders"),
    technicianIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { workOrderId, technicianIds } = args;

    // Check if work order exists
    const workOrder = await ctx.db.get(workOrderId);
    if (!workOrder) {
      throw new Error("Work order not found");
    }

    // Get existing assignments
    const existingAssignments = await ctx.db
      .query("workOrderAssignments")
      .withIndex("by_workOrder", (q) => q.eq("workOrderId", workOrderId))
      .collect();

    // Create a set of technician IDs to remove
    const technicianIdsToRemove = new Set(technicianIds);

    // Remove assignments
    for (const assignment of existingAssignments) {
      if (technicianIdsToRemove.has(assignment.technicianId)) {
        await ctx.db.delete(assignment._id);
      }
    }

    return workOrderId;
  },
});

// Delete a work order
export const deleteWorkOrder = mutation({
  args: { id: v.id("workOrders") },
  handler: async (ctx, args) => {
    // Check if work order exists
    const workOrder = await ctx.db.get(args.id);
    if (!workOrder) {
      throw new Error("Work order not found");
    }

    // Delete technician assignments
    const assignments = await ctx.db
      .query("workOrderAssignments")
      .withIndex("by_workOrder", (q) => q.eq("workOrderId", args.id))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    // Delete the work order
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Change work order status
export const changeWorkOrderStatus = mutation({
  args: {
    id: v.id("workOrders"),
    status: v.string(),
    completedDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, status, completedDate } = args;

    // Check if work order exists
    const workOrder = await ctx.db.get(id);
    if (!workOrder) {
      throw new Error("Work order not found");
    }

    // Validate status transition
    const validStatuses = ["Pending", "Scheduled", "In Progress", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const updates: any = {
      status,
      updatedAt: Date.now(),
    };

    // If marking as completed, set completedDate
    if (status === "Completed") {
      updates.completedDate = completedDate || Date.now();
    }

    // Update the work order status
    await ctx.db.patch(id, updates);

    return id;
  },
});
