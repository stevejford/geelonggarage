import { DatabaseReader } from "../_generated/server";

// Generate a human-readable quote number
export async function generateQuoteNumber(db: DatabaseReader): Promise<string> {
  // Format: Q-YYYYMMDD-XXXX where XXXX is a sequential number
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Find the latest quote number for today
  // Fetch the latest 10 quotes and filter in JS for today's prefix
  const recentQuotes = await db
    .query("quotes")
    .withIndex("by_quoteNumber")
    .order("desc")
    .take(10);

  let sequenceNumber = 1;

  const latestQuote = recentQuotes.find(q => q.quoteNumber.startsWith(`Q-${dateStr}`));
  if (latestQuote) {
    const match = latestQuote.quoteNumber.match(/Q-\d{8}-(\d{4})/);
    if (match) {
      sequenceNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `Q-${dateStr}-${String(sequenceNumber).padStart(4, "0")}`;
}

// Generate a human-readable work order number
export async function generateWorkOrderNumber(db: DatabaseReader): Promise<string> {
  // Format: WO-YYYYMMDD-XXXX where XXXX is a sequential number
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Find the latest work order number for today
  // Fetch the latest 10 work orders and filter in JS for today's prefix
  const recentWorkOrders = await db
    .query("workOrders")
    .withIndex("by_workOrderNumber")
    .order("desc")
    .take(10);

  let sequenceNumber = 1;

  const latestWorkOrder = recentWorkOrders.find(w => w.workOrderNumber.startsWith(`WO-${dateStr}`));
  if (latestWorkOrder) {
    const match = latestWorkOrder.workOrderNumber.match(/WO-\d{8}-(\d{4})/);
    if (match) {
      sequenceNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `WO-${dateStr}-${String(sequenceNumber).padStart(4, "0")}`;
}

// Generate a human-readable invoice number
export async function generateInvoiceNumber(db: DatabaseReader): Promise<string> {
  // Format: INV-YYYYMMDD-XXXX where XXXX is a sequential number
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Find the latest invoice number for today
  // Fetch the latest 10 invoices and filter in JS for today's prefix
  const recentInvoices = await db
    .query("invoices")
    .withIndex("by_invoiceNumber")
    .order("desc")
    .take(10);

  let sequenceNumber = 1;

  const latestInvoice = recentInvoices.find(i => i.invoiceNumber.startsWith(`INV-${dateStr}`));
  if (latestInvoice) {
    const match = latestInvoice.invoiceNumber.match(/INV-\d{8}-(\d{4})/);
    if (match) {
      sequenceNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `INV-${dateStr}-${String(sequenceNumber).padStart(4, "0")}`;
}
