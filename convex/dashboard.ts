import { query } from "./_generated/server";
import { v } from "convex/values";

// Get dashboard metrics
export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    // Get counts for each entity
    const leadsCount = await ctx.db.query("leads").collect();
    const contactsCount = await ctx.db.query("contacts").collect();
    const accountsCount = await ctx.db.query("accounts").collect();
    
    // Get quotes by status
    const quotes = await ctx.db.query("quotes").collect();
    const openQuotes = quotes.filter(q => q.status === "Draft" || q.status === "Presented");
    const acceptedQuotes = quotes.filter(q => q.status === "Accepted");
    const declinedQuotes = quotes.filter(q => q.status === "Declined");
    
    // Get work orders by status
    const workOrders = await ctx.db.query("workOrders").collect();
    const pendingWorkOrders = workOrders.filter(wo => wo.status === "Pending");
    const scheduledWorkOrders = workOrders.filter(wo => wo.status === "Scheduled");
    const inProgressWorkOrders = workOrders.filter(wo => wo.status === "In Progress");
    const completedWorkOrders = workOrders.filter(wo => wo.status === "Completed");
    
    // Get invoices by status
    const invoices = await ctx.db.query("invoices").collect();
    const draftInvoices = invoices.filter(inv => inv.status === "Draft");
    const sentInvoices = invoices.filter(inv => inv.status === "Sent");
    const paidInvoices = invoices.filter(inv => inv.status === "Paid");
    
    // Calculate revenue metrics
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const outstandingRevenue = sentInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    // Calculate conversion rates
    const quoteConversionRate = quotes.length > 0 
      ? (acceptedQuotes.length / quotes.length) * 100 
      : 0;
    
    // Get recent activity
    const recentLeads = await ctx.db
      .query("leads")
      .withIndex("by_createdAt")
      .order("desc")
      .take(5);
      
    const recentQuotes = await ctx.db
      .query("quotes")
      .withIndex("by_createdAt")
      .order("desc")
      .take(5);
      
    const recentWorkOrders = await ctx.db
      .query("workOrders")
      .withIndex("by_createdAt")
      .order("desc")
      .take(5);
      
    const recentInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_createdAt")
      .order("desc")
      .take(5);
    
    // Return all metrics
    return {
      counts: {
        leads: leadsCount.length,
        contacts: contactsCount.length,
        accounts: accountsCount.length,
        quotes: quotes.length,
        workOrders: workOrders.length,
        invoices: invoices.length,
      },
      quotes: {
        open: openQuotes.length,
        accepted: acceptedQuotes.length,
        declined: declinedQuotes.length,
        conversionRate: quoteConversionRate,
      },
      workOrders: {
        pending: pendingWorkOrders.length,
        scheduled: scheduledWorkOrders.length,
        inProgress: inProgressWorkOrders.length,
        completed: completedWorkOrders.length,
      },
      invoices: {
        draft: draftInvoices.length,
        sent: sentInvoices.length,
        paid: paidInvoices.length,
        totalRevenue,
        outstandingRevenue,
      },
      recentActivity: {
        leads: recentLeads,
        quotes: recentQuotes,
        workOrders: recentWorkOrders,
        invoices: recentInvoices,
      }
    };
  },
});

// Get recent activity for the dashboard
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get recent leads
    const recentLeads = await ctx.db
      .query("leads")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
      
    // Get recent quotes
    const recentQuotes = await ctx.db
      .query("quotes")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
      
    // Get recent work orders
    const recentWorkOrders = await ctx.db
      .query("workOrders")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
      
    // Get recent invoices
    const recentInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    
    // Combine all activities and sort by creation time
    const allActivities = [
      ...recentLeads.map(lead => ({
        type: "lead",
        action: "New lead created",
        name: lead.name,
        time: lead.createdAt,
        id: lead._id,
      })),
      ...recentQuotes.map(quote => ({
        type: "quote",
        action: `Quote ${quote.status === "Accepted" ? "accepted" : quote.status === "Declined" ? "declined" : "created"}`,
        name: quote.quoteNumber,
        time: quote.updatedAt || quote.createdAt,
        id: quote._id,
      })),
      ...recentWorkOrders.map(wo => ({
        type: "workorder",
        action: `Work order ${wo.status.toLowerCase()}`,
        name: wo.workOrderNumber,
        time: wo.updatedAt || wo.createdAt,
        id: wo._id,
      })),
      ...recentInvoices.map(inv => ({
        type: "invoice",
        action: `Invoice ${inv.status === "Paid" ? "paid" : inv.status === "Sent" ? "sent" : "created"}`,
        name: inv.invoiceNumber,
        time: inv.updatedAt || inv.createdAt,
        id: inv._id,
      })),
    ];
    
    // Sort by time (most recent first)
    allActivities.sort((a, b) => b.time - a.time);
    
    // Return the most recent activities
    return allActivities.slice(0, limit);
  },
});
