import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Chat groups
  chatGroups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(), // Clerk user ID
    isPrivate: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  // Group members
  groupMembers: defineTable({
    groupId: v.id("chatGroups"),
    userId: v.string(), // Clerk user ID
    role: v.union(
      v.literal("admin"),
      v.literal("member")
    ),
    joinedAt: v.number(),
  }).index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_user", ["groupId", "userId"]),

  // Chat messages
  chatMessages: defineTable({
    groupId: v.optional(v.id("chatGroups")), // Optional for direct messages
    senderId: v.string(), // Clerk user ID
    receiverId: v.optional(v.string()), // For direct messages
    senderName: v.string(),
    senderAvatar: v.optional(v.string()),
    content: v.string(),
    attachments: v.optional(v.array(v.string())), // URLs to attachments
    isRead: v.boolean(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"])
    .index("by_group", ["groupId", "timestamp"])
    .index("by_direct_message", ["senderId", "receiverId", "timestamp"])
    .index("by_receiver", ["receiverId", "timestamp"]),

  // User chat status
  userChatStatus: defineTable({
    userId: v.string(), // Clerk user ID
    lastSeen: v.number(),
    isOnline: v.boolean(),
  }).index("by_userId", ["userId"]),

  // Last read messages
  lastReadMessages: defineTable({
    userId: v.string(), // Clerk user ID
    groupId: v.optional(v.id("chatGroups")),
    otherUserId: v.optional(v.string()), // For direct messages
    lastReadTimestamp: v.number(),
  }).index("by_user_group", ["userId", "groupId"])
    .index("by_user_direct", ["userId", "otherUserId"]),

  // User roles table
  userRoles: defineTable({
    userId: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("technician"),
      v.literal("user")
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  // Users table
  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    clerkId: v.optional(v.string()),
    status: v.optional(v.string()), // active, pending, inactive
    imageUrl: v.optional(v.string()), // Profile image URL from Clerk
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"]).index("by_clerkId", ["clerkId"]),

  // Lead management
  leads: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.string(), // New, Contacted, Qualified, Unqualified, Converted
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()), // userId
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_createdBy", ["createdBy"]),

  // Contact management
  contacts: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()), // userId
  })
    .index("by_name", ["lastName", "firstName"])
    .index("by_createdAt", ["createdAt"])
    .index("by_createdBy", ["createdBy"])
    .index("by_placeId", ["placeId"]),

  // Account/Property management
  accounts: defineTable({
    name: v.string(), // Property/Business name
    type: v.string(), // Residential, Commercial, etc.
    address: v.string(),
    unit: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
    // Google Maps data
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
    // Google Maps photo data
    photoCount: v.optional(v.number()),
    photoMetadata: v.optional(v.array(v.object({
      photoReference: v.string(),
      width: v.number(),
      height: v.number(),
      attribution: v.string(),
      index: v.number()
    }))),
    // Legacy field - will be migrated to photoMetadata
    photoReferences: v.optional(v.array(v.any())),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()), // userId
  })
    .index("by_name", ["name"])
    .index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"])
    .index("by_createdBy", ["createdBy"])
    .index("by_placeId", ["placeId"]),

  // Contact-Account relationships
  contactAccounts: defineTable({
    contactId: v.id("contacts"),
    accountId: v.id("accounts"),
    relationship: v.optional(v.string()), // Owner, Tenant, Manager, etc.
    isPrimary: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_contact", ["contactId"])
    .index("by_account", ["accountId"])
    .index("by_contact_account", ["contactId", "accountId"]),

  // Quote management
  quotes: defineTable({
    quoteNumber: v.string(), // Human-readable quote number
    contactId: v.id("contacts"),
    accountId: v.id("accounts"),
    status: v.string(), // Draft, Presented, Accepted, Declined
    issueDate: v.number(),
    expiryDate: v.optional(v.number()),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
    pdfStorageId: v.optional(v.id("_storage")), // Storage ID for generated PDF
    pdfGeneratedAt: v.optional(v.number()), // When the PDF was last generated
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()), // userId
  })
    .index("by_quoteNumber", ["quoteNumber"])
    .index("by_contact", ["contactId"])
    .index("by_account", ["accountId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_createdBy", ["createdBy"]),

  // Quote line items
  quoteLineItems: defineTable({
    quoteId: v.id("quotes"),
    description: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    total: v.number(),
    sortOrder: v.number(),
  }).index("by_quote", ["quoteId"]),

  // Work order management
  workOrders: defineTable({
    workOrderNumber: v.string(), // Human-readable work order number
    contactId: v.id("contacts"),
    accountId: v.id("accounts"),
    quoteId: v.optional(v.id("quotes")),
    status: v.string(), // Pending, Scheduled, In Progress, Completed, Cancelled
    scheduledDate: v.optional(v.number()),
    completedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    pdfStorageId: v.optional(v.id("_storage")), // Storage ID for generated PDF
    pdfGeneratedAt: v.optional(v.number()), // When the PDF was last generated
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()), // userId
  })
    .index("by_workOrderNumber", ["workOrderNumber"])
    .index("by_contact", ["contactId"])
    .index("by_account", ["accountId"])
    .index("by_quote", ["quoteId"])
    .index("by_status", ["status"])
    .index("by_scheduledDate", ["scheduledDate"])
    .index("by_createdAt", ["createdAt"])
    .index("by_createdBy", ["createdBy"]),

  // Work order technician assignments
  workOrderAssignments: defineTable({
    workOrderId: v.id("workOrders"),
    technicianId: v.string(), // userId of technician
    assignedAt: v.number(),
    assignedBy: v.string(), // userId
  })
    .index("by_workOrder", ["workOrderId"])
    .index("by_technician", ["technicianId"]),

  // Invoice management
  invoices: defineTable({
    invoiceNumber: v.string(), // Human-readable invoice number
    contactId: v.id("contacts"),
    accountId: v.id("accounts"),
    workOrderId: v.optional(v.id("workOrders")),
    quoteId: v.optional(v.id("quotes")),
    status: v.string(), // Draft, Sent, Paid, Cancelled
    issueDate: v.number(),
    dueDate: v.number(),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
    pdfStorageId: v.optional(v.id("_storage")), // Storage ID for generated PDF
    pdfGeneratedAt: v.optional(v.number()), // When the PDF was last generated
    lastSentAt: v.optional(v.number()), // When the invoice was last sent via email
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()), // userId
  })
    .index("by_invoiceNumber", ["invoiceNumber"])
    .index("by_contact", ["contactId"])
    .index("by_account", ["accountId"])
    .index("by_workOrder", ["workOrderId"])
    .index("by_quote", ["quoteId"])
    .index("by_status", ["status"])
    .index("by_dueDate", ["dueDate"])
    .index("by_createdAt", ["createdAt"])
    .index("by_createdBy", ["createdBy"]),

  // Invoice line items
  invoiceLineItems: defineTable({
    invoiceId: v.id("invoices"),
    description: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    total: v.number(),
    sortOrder: v.number(),
  }).index("by_invoice", ["invoiceId"]),

  // Settings
  settings: defineTable({
    type: v.string(), // general, company, integrations
    appName: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.string()),
    timezone: v.optional(v.string()),
    enableNotifications: v.optional(v.boolean()),
    language: v.optional(v.string()),
    // Company settings
    companyName: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    taxId: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    // Integration settings (stored as JSON in fields)
    stripe: v.optional(v.any()),
    mailchimp: v.optional(v.any()),
    googleCalendar: v.optional(v.any()),
    slack: v.optional(v.any()),
    quickbooks: v.optional(v.any()),
    mcp: v.optional(v.any()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_type", ["type"]),

  // Roles
  roles: defineTable({
    name: v.string(),
    description: v.string(),
    permissions: v.array(v.string()),
    isSystem: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_name", ["name"]),

  // Permissions
  permissions: defineTable({
    name: v.string(),
    description: v.string(),
    module: v.string(),
    createdAt: v.optional(v.number()),
  }).index("by_module", ["module"]),

  // Email history
  emailHistory: defineTable({
    documentType: v.string(), // "invoice", "quote", "workOrder"
    documentId: v.string(), // ID of the related document
    recipientEmail: v.string(), // Email address of the recipient
    subject: v.string(), // Email subject
    message: v.string(), // Email message content
    pdfUrl: v.optional(v.string()), // URL of the PDF that was sent
    sentAt: v.number(), // Timestamp when the email was sent
    sentBy: v.optional(v.string()), // User ID who sent the email
    status: v.string(), // "sent", "failed"
    errorMessage: v.optional(v.string()), // Error message if sending failed
  }).index("by_document", ["documentType", "documentId"])
    .index("by_recipient", ["recipientEmail"])
    .index("by_sentAt", ["sentAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
