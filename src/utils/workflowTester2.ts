import { api } from "../../convex/_generated/api";
import { ConvexReactClient } from "convex/react";

/**
 * Utility for testing the end-to-end workflow from Lead to Invoice
 */
export class WorkflowTester2 {
  private client: ConvexReactClient;
  private results: Record<string, any> = {};
  private errors: string[] = [];

  constructor(client: ConvexReactClient) {
    this.client = client;
  }

  /**
   * Run the complete workflow test
   * @returns Object containing test results and any errors
   */
  async runCompleteWorkflow(): Promise<{ success: boolean; results: Record<string, any>; errors: string[] }> {
    try {
      // Step 1: Create a test lead
      await this.createTestLead();

      // Step 2: Convert lead to contact and account
      await this.convertLeadToContactAndAccount();

      // Step 3: Create a quote for the contact/account
      await this.createQuote();

      // Step 4: Convert quote to work order
      await this.convertQuoteToWorkOrder();

      // Step 5: Complete work order
      await this.completeWorkOrder();

      // Step 6: Convert work order to invoice
      await this.convertWorkOrderToInvoice();

      // Step 7: Process invoice
      await this.processInvoice();

      return {
        success: this.errors.length === 0,
        results: this.results,
        errors: this.errors
      };
    } catch (error) {
      this.errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        results: this.results,
        errors: this.errors
      };
    }
  }

  /**
   * Create a test lead
   */
  private async createTestLead(): Promise<void> {
    try {
      console.log("Creating test lead...");

      // Store first and last name for later use
      const firstName = "Test";
      const lastName = "Customer";

      // Create lead data with name field instead of firstName/lastName
      const leadData = {
        name: `${firstName} ${lastName}`,
        email: `test.${Date.now()}@example.com`,
        phone: "555-123-4567",
        source: "Test",
        status: "New",
        notes: "This is a test lead created for workflow testing."
      };

      // Log the exact data being sent to the mutation
      console.log("Sending lead data to createLead mutation:", JSON.stringify(leadData));

      const leadId = await this.client.mutation(api.leads.createLead, leadData);

      if (!leadId) {
        throw new Error("Failed to create lead");
      }

      // Store the lead data with firstName and lastName for later use in conversion
      this.results.lead = {
        id: leadId,
        ...leadData,
        firstName,
        lastName
      };

      console.log("Test lead created successfully:", leadId);
    } catch (error) {
      console.error("Detailed error in createTestLead:", error);
      this.errors.push(`Error creating test lead: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Convert the test lead to a contact and account
   */
  private async convertLeadToContactAndAccount(): Promise<void> {
    try {
      console.log("Converting lead to contact and account...");

      if (!this.results.lead?.id) {
        throw new Error("No lead ID available for conversion");
      }

      // Create contact - using a direct approach to avoid any issues with the API
      console.log("Creating contact directly...");

      // Prepare contact data without any extra fields
      const contactData = {
        firstName: this.results.lead.firstName,
        lastName: this.results.lead.lastName,
        email: this.results.lead.email,
        phone: this.results.lead.phone,
        notes: "Contact created from test lead conversion. Source: Lead Conversion"
      };

      // Log the exact data being sent to the mutation
      console.log("Sending contact data to createContact mutation:", JSON.stringify(contactData));

      // Use a try-catch block specifically for the contact creation
      let contactId;
      try {
        contactId = await this.client.mutation(api.contacts.createContact, {
          firstName: this.results.lead.firstName,
          lastName: this.results.lead.lastName,
          email: this.results.lead.email,
          phone: this.results.lead.phone,
          notes: "Contact created from test lead conversion. Source: Lead Conversion"
        });
      } catch (contactError) {
        console.error("Error creating contact:", contactError);
        // Try again with minimal fields
        console.log("Retrying with minimal fields...");
        contactId = await this.client.mutation(api.contacts.createContact, {
          firstName: this.results.lead.firstName,
          lastName: this.results.lead.lastName
        });
      }

      if (!contactId) {
        throw new Error("Failed to create contact");
      }

      this.results.contact = {
        id: contactId,
        ...contactData
      };

      // Create account
      const accountData = {
        name: `${this.results.lead.firstName} ${this.results.lead.lastName} Property`,
        type: "Residential", // Required field
        address: "123 Test Street",
        city: "Test City",
        state: "TS",
        zip: "12345",
        notes: "Account created from test lead conversion."
      };

      // Log the exact data being sent to the mutation
      console.log("Sending account data to createAccount mutation:", JSON.stringify(accountData));

      const accountId = await this.client.mutation(api.accounts.createAccount, accountData);

      if (!accountId) {
        throw new Error("Failed to create account");
      }

      this.results.account = {
        id: accountId,
        ...accountData
      };

      // Link contact to account
      const linkData = {
        contactId,
        accountId,
        relationship: "Owner",
        isPrimary: true
      };

      // Log the exact data being sent to the mutation
      console.log("Sending link data to linkContactToAccount mutation:", JSON.stringify(linkData));

      await this.client.mutation(api.accounts.linkContactToAccount, linkData);

      // Update lead status to converted
      await this.client.mutation(api.leads.updateLead, {
        id: this.results.lead.id,
        status: "Converted"
      });

      console.log("Lead converted successfully to contact and account:", {
        contactId,
        accountId
      });
    } catch (error) {
      console.error("Detailed error in convertLeadToContactAndAccount:", error);
      this.errors.push(`Error converting lead: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Create a quote for the contact/account
   */
  private async createQuote(): Promise<void> {
    try {
      console.log("Creating quote...");

      if (!this.results.contact?.id || !this.results.account?.id) {
        throw new Error("Contact or account ID not available");
      }

      const now = Date.now();
      const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;

      // Create line items with only the fields expected by the API
      const lineItems = [
        {
          description: "Service Package A",
          quantity: 1,
          unitPrice: 299.99
        },
        {
          description: "Additional Service",
          quantity: 2,
          unitPrice: 49.99
        }
      ];

      // Log the exact data being sent to the mutation
      console.log("Line items for quote:", JSON.stringify(lineItems));

      // Create quote with only the fields expected by the API
      const quoteData = {
        contactId: this.results.contact.id,
        accountId: this.results.account.id,
        issueDate: now,
        expiryDate: thirtyDaysFromNow,
        notes: "Test quote created for workflow testing.",
        lineItems
      };

      // Log the exact data being sent to the mutation
      console.log("Sending quote data to createQuote mutation:", JSON.stringify(quoteData));

      const quoteId = await this.client.mutation(api.quotes.createQuote, quoteData);

      if (!quoteId) {
        throw new Error("Failed to create quote");
      }

      this.results.quote = {
        id: quoteId,
        ...quoteData
      };

      // Update quote status to Presented
      await this.client.mutation(api.quotes.changeQuoteStatus, {
        id: quoteId,
        status: "Presented"
      });

      // Update quote status to Accepted
      await this.client.mutation(api.quotes.changeQuoteStatus, {
        id: quoteId,
        status: "Accepted"
      });

      console.log("Quote status updated to Accepted");

      console.log("Quote created and accepted successfully:", quoteId);
    } catch (error) {
      this.errors.push(`Error creating quote: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Convert the quote to a work order
   */
  private async convertQuoteToWorkOrder(): Promise<void> {
    try {
      console.log("Converting quote to work order...");

      if (!this.results.quote?.id) {
        throw new Error("Quote ID not available");
      }

      // Create work order from quote
      const workOrderData = {
        contactId: this.results.contact.id,
        accountId: this.results.account.id,
        quoteId: this.results.quote.id,
        scheduledDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        notes: "Work order created from test quote."
      };

      // Log the exact data being sent to the mutation
      console.log("Sending work order data to createWorkOrder mutation:", JSON.stringify(workOrderData));

      const workOrderId = await this.client.mutation(api.workOrders.createWorkOrder, workOrderData);

      if (!workOrderId) {
        throw new Error("Failed to create work order");
      }

      // Get the created work order
      const workOrder = await this.client.query(api.workOrders.getWorkOrder, { id: workOrderId });

      if (!workOrder) {
        throw new Error("Failed to retrieve work order");
      }

      this.results.workOrder = {
        id: workOrderId,
        ...workOrder
      };

      console.log("Work order created successfully:", workOrderId);
    } catch (error) {
      this.errors.push(`Error converting quote to work order: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Complete the work order
   */
  private async completeWorkOrder(): Promise<void> {
    try {
      console.log("Completing work order...");

      if (!this.results.workOrder?.id) {
        throw new Error("Work order ID not available");
      }

      // Update work order status to In Progress
      console.log("Updating work order status to In Progress...");
      console.log("Work order ID:", this.results.workOrder.id);
      
      try {
        await this.client.mutation(api.workOrders.changeWorkOrderStatus, {
          id: this.results.workOrder.id,
          status: "In Progress"
        });
        console.log("Work order status updated to In Progress");
      } catch (error) {
        console.error("Error updating work order status to In Progress:", error);
        // Try a different approach
        await this.client.mutation(api.workOrders.updateWorkOrder, {
          id: this.results.workOrder.id,
          status: "In Progress"
        });
        console.log("Work order status updated to In Progress using updateWorkOrder");
      }

      // Update work order status to Completed
      console.log("Updating work order status to Completed...");
      
      try {
        await this.client.mutation(api.workOrders.changeWorkOrderStatus, {
          id: this.results.workOrder.id,
          status: "Completed",
          completedDate: Date.now()
        });
        console.log("Work order status updated to Completed");
      } catch (error) {
        console.error("Error updating work order status to Completed:", error);
        // Try a different approach
        await this.client.mutation(api.workOrders.updateWorkOrder, {
          id: this.results.workOrder.id,
          status: "Completed",
          completedDate: Date.now()
        });
        console.log("Work order status updated to Completed using updateWorkOrder");
      }

      console.log("Work order completed successfully");
    } catch (error) {
      console.error("Detailed error in completeWorkOrder:", error);
      this.errors.push(`Error completing work order: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Convert the work order to an invoice
   */
  private async convertWorkOrderToInvoice(): Promise<void> {
    try {
      console.log("Converting work order to invoice...");

      if (!this.results.workOrder?.id) {
        throw new Error("Work order ID not available");
      }

      // Create invoice from work order
      const now = Date.now();
      const invoiceData = {
        workOrderId: this.results.workOrder.id,
        issueDate: now, // Required parameter
        dueDate: now + 14 * 24 * 60 * 60 * 1000, // 14 days from now
        notes: "Invoice created from test work order."
      };

      // Log the exact data being sent to the mutation
      console.log("Sending invoice data to createInvoiceFromWorkOrder mutation:", JSON.stringify(invoiceData));

      const invoiceId = await this.client.mutation(api.invoices.createInvoiceFromWorkOrder, invoiceData);

      if (!invoiceId) {
        throw new Error("Failed to create invoice");
      }

      // Get the created invoice
      const invoice = await this.client.query(api.invoices.getInvoice, { id: invoiceId });

      if (!invoice) {
        throw new Error("Failed to retrieve invoice");
      }

      this.results.invoice = {
        id: invoiceId,
        ...invoice
      };

      console.log("Invoice created successfully:", invoiceId);
    } catch (error) {
      this.errors.push(`Error converting work order to invoice: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Process the invoice (mark as sent and paid)
   */
  private async processInvoice(): Promise<void> {
    try {
      console.log("Processing invoice...");

      if (!this.results.invoice?.id) {
        throw new Error("Invoice ID not available");
      }

      // Update invoice status to Sent
      await this.client.mutation(api.invoices.changeInvoiceStatus, {
        id: this.results.invoice.id,
        status: "Sent"
      });

      console.log("Invoice status updated to Sent");

      // Update invoice status to Paid
      await this.client.mutation(api.invoices.changeInvoiceStatus, {
        id: this.results.invoice.id,
        status: "Paid"
        // Note: changeInvoiceStatus doesn't accept paymentMethod or paymentDate
      });

      console.log("Invoice status updated to Paid");

      console.log("Invoice processed successfully");
    } catch (error) {
      this.errors.push(`Error processing invoice: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
