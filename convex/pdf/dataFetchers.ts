import { DatabaseReader } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { formatCurrency, formatDate } from "./utils";
import { QuoteTemplateData, InvoiceTemplateData, WorkOrderTemplateData } from "./types";

// Get quote data for PDF generation
export async function getQuoteData(
  db: DatabaseReader,
  id: Id<"quotes">
): Promise<QuoteTemplateData | null> {
  // Get the quote
  const quote = await db.get(id);

  if (!quote) {
    return null;
  }

  // Get the contact
  const contact = quote.contactId ? await db.get(quote.contactId) : null;

  // Get the account
  const account = quote.accountId ? await db.get(quote.accountId) : null;

  // Get line items
  const lineItems = await db
    .query("quoteLineItems")
    .withIndex("by_quote", (q) => q.eq("quoteId", id))
    .collect();

  // Format data for the template
  return {
    company_name: "Geelong Garage",
    company_address_line1: "123 Main Street",
    company_address_line2: "Geelong, VIC 3220",
    company_phone: "(03) 5222 1234",
    company_email: "info@geelonggarage.com",
    company_bank_name: "Commonwealth Bank of Australia",
    company_account_name: "Geelong Garage Pty Ltd",
    company_bsb: "063-000",
    company_account_number: "12345678",
    logo_url: "https://via.placeholder.com/150", // Replace with actual logo URL

    quote_number: quote.quoteNumber,
    quote_date: formatDate(quote.issueDate),
    expiry_date: quote.expiryDate ? formatDate(quote.expiryDate) : "N/A",

    customer_name: contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Customer",
    customer_address_line1: contact?.address || "",
    customer_address_line2: contact?.city ? `${contact.city}, ${contact.state || ""}` : "",
    customer_phone: contact?.phone || "",
    customer_email: contact?.email || "",

    status: quote.status,
    status_class: quote.status.toLowerCase(),

    line_items: lineItems.map((item) => ({
      quantity: item.quantity,
      description: item.description,
      unit_price: formatCurrency(item.unitPrice),
      total: formatCurrency(item.quantity * item.unitPrice),
    })),

    subtotal: formatCurrency(quote.subtotal),
    tax: formatCurrency(quote.tax),
    total: formatCurrency(quote.total),

    notes: quote.notes || "",
    generated_date: formatDate(Date.now()),
  };
}

// Get invoice data for PDF generation
export async function getInvoiceData(
  db: DatabaseReader,
  id: Id<"invoices">
): Promise<InvoiceTemplateData | null> {
  // Get the invoice
  const invoice = await db.get(id);

  if (!invoice) {
    return null;
  }

  // Get the contact
  const contact = invoice.contactId ? await db.get(invoice.contactId) : null;

  // Get the account
  const account = invoice.accountId ? await db.get(invoice.accountId) : null;

  // Get the work order
  const workOrder = invoice.workOrderId ? await db.get(invoice.workOrderId) : null;

  // Get line items
  const lineItems = await db
    .query("invoiceLineItems")
    .withIndex("by_invoice", (q) => q.eq("invoiceId", id))
    .collect();

  // Determine status class
  let statusClass = "unpaid";
  if (invoice.status === "Paid") {
    statusClass = "paid";
  } else if (invoice.status === "Sent" && invoice.dueDate < Date.now()) {
    statusClass = "overdue";
  }

  // Format data for the template
  return {
    company_name: "Geelong Garage",
    company_address_line1: "123 Main Street",
    company_address_line2: "Geelong, VIC 3220",
    company_phone: "(03) 5222 1234",
    company_email: "info@geelonggarage.com",
    company_bank_name: "Commonwealth Bank of Australia",
    company_account_name: "Geelong Garage Pty Ltd",
    company_bsb: "063-000",
    company_account_number: "12345678",
    logo_url: "https://via.placeholder.com/150", // Replace with actual logo URL

    invoice_number: invoice.invoiceNumber,
    invoice_date: formatDate(invoice.issueDate),
    due_date: formatDate(invoice.dueDate),

    customer_name: contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Customer",
    customer_address_line1: contact?.address || "",
    customer_address_line2: contact?.city ? `${contact.city}, ${contact.state || ""}` : "",
    customer_phone: contact?.phone || "",
    customer_email: contact?.email || "",

    status: invoice.status,
    status_class: statusClass,

    work_order_number: workOrder ? workOrder.workOrderNumber : null,
    work_order_completed_date: workOrder && workOrder.completedDate ? formatDate(workOrder.completedDate) : null,

    line_items: lineItems.map((item) => ({
      quantity: item.quantity,
      description: item.description,
      unit_price: formatCurrency(item.unitPrice),
      total: formatCurrency(item.quantity * item.unitPrice),
    })),

    subtotal: formatCurrency(invoice.subtotal),
    tax: formatCurrency(invoice.tax),
    total: formatCurrency(invoice.total),

    notes: invoice.notes || "",
    generated_date: formatDate(Date.now()),
  };
}

// Get work order data for PDF generation
export async function getWorkOrderData(
  db: DatabaseReader,
  id: Id<"workOrders">
): Promise<WorkOrderTemplateData | null> {
  // Get the work order
  const workOrder = await db.get(id);

  if (!workOrder) {
    return null;
  }

  // Get the contact
  const contact = workOrder.contactId ? await db.get(workOrder.contactId) : null;

  // Get the account
  const account = workOrder.accountId ? await db.get(workOrder.accountId) : null;

  // Get technician assignments
  const assignments = await db
    .query("workOrderAssignments")
    .withIndex("by_workOrder", (q) => q.eq("workOrderId", id))
    .collect();

  // Get technicians
  const technicians = [];
  for (const assignment of assignments) {
    if (assignment.technicianId) {
      const technician = await db.get(assignment.technicianId as Id<"users">);
      if (technician) {
        technicians.push({
          name: `${technician.firstName || ""} ${technician.lastName || ""}`
        });
      }
    }
  }

  // Format data for the template
  return {
    company_name: "Geelong Garage",
    company_address_line1: "123 Main Street",
    company_address_line2: "Geelong, VIC 3220",
    company_phone: "(03) 5222 1234",
    company_email: "info@geelonggarage.com",
    company_bank_name: "Commonwealth Bank of Australia",
    company_account_name: "Geelong Garage Pty Ltd",
    company_bsb: "063-000",
    company_account_number: "12345678",
    logo_url: "https://via.placeholder.com/150", // Replace with actual logo URL

    work_order_number: workOrder.workOrderNumber,
    created_date: formatDate(workOrder.createdAt),
    scheduled_date: workOrder.scheduledDate ? formatDate(workOrder.scheduledDate) : "Not scheduled",
    completed_date: workOrder.completedDate ? formatDate(workOrder.completedDate) : null,

    customer_name: contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Customer",
    customer_address_line1: contact?.address || "",
    customer_address_line2: contact?.city ? `${contact.city}, ${contact.state || ""}` : "",
    customer_phone: contact?.phone || "",
    customer_email: contact?.email || "",

    status: workOrder.status,
    status_class: workOrder.status.toLowerCase().replace(" ", "-"),

    technicians: technicians.length > 0 ? technicians : [{ name: "Unassigned" }],

    notes: workOrder.notes || "No notes provided.",
    generated_date: formatDate(Date.now()),
  };
}
