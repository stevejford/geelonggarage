import { api } from "../../convex/_generated/api";
import { ConvexReactClient } from "convex/react";

/**
 * Utility for generating test data for chart visualization testing
 */
export class ChartDataTester {
  private client: ConvexReactClient;
  private results: Record<string, any> = {};
  private errors: string[] = [];

  // Configuration for test data generation
  private config = {
    // Number of entities to create
    leads: 10,
    contacts: 5,
    accounts: 3,
    quotes: 8,
    workOrders: 6,
    invoices: 7,

    // Status distribution (approximate percentages)
    leadStatus: {
      New: 20,
      Contacted: 15,
      Qualified: 25,
      Unqualified: 10,
      Converted: 30
    },

    quoteStatus: {
      Draft: 20,
      Presented: 30,
      Accepted: 40,
      Declined: 10
    },

    workOrderStatus: {
      Pending: 30,
      Scheduled: 20,
      "In Progress": 25,
      Completed: 25
    },

    invoiceStatus: {
      Draft: 20,
      Sent: 30,
      Paid: 40,
      Void: 10
    }
  };

  constructor(client: ConvexReactClient) {
    this.client = client;
  }

  /**
   * Run the chart data generation test
   * @returns Object containing test results and any errors
   */
  async generateChartData(): Promise<{ success: boolean; results: Record<string, any>; errors: string[] }> {
    try {
      // Step 1: Create test accounts
      await this.createTestAccounts();

      // Step 2: Create test contacts
      await this.createTestContacts();

      // Step 3: Create test leads with various statuses
      await this.createTestLeads();

      // Step 4: Create test quotes with various statuses
      await this.createTestQuotes();

      // Step 5: Create test work orders with various statuses
      await this.createTestWorkOrders();

      // Step 6: Create test invoices with various statuses
      await this.createTestInvoices();

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
   * Helper function to get a random element from an array
   */
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Helper function to get a random date within a range
   */
  private getRandomDate(startDate: Date, endDate: Date): Date {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return new Date(start + Math.random() * (end - start));
  }

  /**
   * Helper function to get a weighted random status based on configuration
   */
  private getWeightedRandomStatus(statusConfig: Record<string, number>): string {
    const statuses = Object.keys(statusConfig);
    const weights = Object.values(statusConfig);

    // Calculate cumulative weights
    const cumulativeWeights: number[] = [];
    let sum = 0;
    for (const weight of weights) {
      sum += weight;
      cumulativeWeights.push(sum);
    }

    // Get a random number between 0 and the sum of all weights
    const random = Math.random() * sum;

    // Find the status corresponding to the random number
    for (let i = 0; i < cumulativeWeights.length; i++) {
      if (random < cumulativeWeights[i]) {
        return statuses[i];
      }
    }

    return statuses[0]; // Fallback
  }

  /**
   * Helper function to get a random amount within a range
   */
  private getRandomAmount(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Create test accounts
   */
  private async createTestAccounts(): Promise<void> {
    try {
      console.log("Creating test accounts...");

      const companyNames = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Corp', 'Stark Industries'];
      const accountIds: string[] = [];

      for (let i = 0; i < this.config.accounts; i++) {
        const name = companyNames[i % companyNames.length];
        const accountData = {
          name,
          type: 'Commercial',
          address: `${100 + i} Business St`,
          city: 'Businessville',
          state: 'CA',
          zip: '90210', // Note: it's 'zip', not 'zipCode'
          notes: 'Created for chart testing'
        };

        const accountId = await this.client.mutation(api.accounts.createAccount, accountData);
        accountIds.push(accountId);
      }

      this.results.accounts = accountIds;
      console.log(`Created ${accountIds.length} test accounts`);
    } catch (error) {
      this.errors.push(`Error creating test accounts: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Create test contacts
   */
  private async createTestContacts(): Promise<void> {
    try {
      console.log("Creating test contacts...");

      const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
      const contactIds: string[] = [];

      for (let i = 0; i < this.config.contacts; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];

        // Create contact first (without accountId)
        const contactData = {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          phone: `555-${200 + i}-${2000 + i}`,
          address: `${200 + i} Main St`,
          city: 'Springfield',
          state: 'IL',
          zip: '62701',
          notes: 'Created for chart testing'
        };

        const contactId = await this.client.mutation(api.contacts.createContact, contactData);
        contactIds.push(contactId);

        // If we have accounts, link this contact to a random account
        if (this.results.accounts?.length > 0) {
          const accountId = this.getRandomElement(this.results.accounts);
          try {
            await this.client.mutation(api.accounts.linkContactToAccount, {
              contactId,
              accountId,
              relationship: 'Customer',
              isPrimary: Math.random() > 0.7 // 30% chance of being primary
            });
          } catch (linkError) {
            console.warn(`Could not link contact to account: ${linkError}`);
          }
        }
      }

      this.results.contacts = contactIds;
      console.log(`Created ${contactIds.length} test contacts`);
    } catch (error) {
      this.errors.push(`Error creating test contacts: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Create test leads with various statuses
   */
  private async createTestLeads(): Promise<void> {
    try {
      console.log("Creating test leads...");

      const firstNames = ['Alex', 'Taylor', 'Jordan', 'Casey', 'Morgan'];
      const lastNames = ['Garcia', 'Miller', 'Davis', 'Rodriguez', 'Wilson'];
      const sources = ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media'];
      const leadIds: string[] = [];

      for (let i = 0; i < this.config.leads; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const name = `${firstName} ${lastName}`;
        const status = this.getWeightedRandomStatus(this.config.leadStatus);

        const leadData = {
          name,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          phone: `555-${300 + i}-${3000 + i}`,
          source: this.getRandomElement(sources),
          status,
          notes: 'Created for chart testing'
        };

        const leadId = await this.client.mutation(api.leads.createLead, leadData);
        leadIds.push(leadId);
      }

      this.results.leads = leadIds;
      console.log(`Created ${leadIds.length} test leads`);
    } catch (error) {
      this.errors.push(`Error creating test leads: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Create test quotes with various statuses
   */
  private async createTestQuotes(): Promise<void> {
    try {
      console.log("Creating test quotes...");

      if (!this.results.contacts?.length) {
        throw new Error("No contacts available for creating quotes");
      }

      const quoteIds: string[] = [];

      for (let i = 0; i < this.config.quotes; i++) {
        const contactId = this.getRandomElement(this.results.contacts);
        const accountId = this.results.accounts?.length > 0 ?
          this.getRandomElement(this.results.accounts) : undefined;

        const status = this.getWeightedRandomStatus(this.config.quoteStatus);
        const total = this.getRandomAmount(500, 5000);
        const issueDate = this.getRandomDate(new Date(2023, 0, 1), new Date()).getTime();
        const expiryDate = new Date(issueDate);
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Create line items
        const lineItems = [
          {
            description: "Service Package",
            quantity: Math.floor(Math.random() * 3) + 1,
            unitPrice: this.getRandomAmount(100, 1000)
          }
        ];

        // Create quote with only the fields expected by the API
        const quoteData = {
          contactId,
          accountId,
          issueDate,
          expiryDate: expiryDate.getTime(),
          lineItems,
          notes: 'Created for chart testing'
        };

        const quoteId = await this.client.mutation(api.quotes.createQuote, quoteData);

        // Update status if not Draft
        if (status !== 'Draft') {
          await this.client.mutation(api.quotes.changeQuoteStatus, {
            id: quoteId,
            status
          });
        }

        quoteIds.push(quoteId);
      }

      this.results.quotes = quoteIds;
      console.log(`Created ${quoteIds.length} test quotes`);
    } catch (error) {
      this.errors.push(`Error creating test quotes: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Create test work orders with various statuses
   */
  private async createTestWorkOrders(): Promise<void> {
    try {
      console.log("Creating test work orders...");

      if (!this.results.contacts?.length) {
        throw new Error("No contacts available for creating work orders");
      }

      const workOrderIds: string[] = [];

      for (let i = 0; i < this.config.workOrders; i++) {
        const contactId = this.getRandomElement(this.results.contacts);
        const accountId = this.results.accounts?.length > 0 ?
          this.getRandomElement(this.results.accounts) : undefined;

        const status = this.getWeightedRandomStatus(this.config.workOrderStatus);
        const scheduledDate = this.getRandomDate(new Date(2023, 0, 1), new Date(2023, 11, 31)).getTime();

        const workOrderData = {
          workOrderNumber: `WO-${20000 + i}`,
          contactId,
          accountId,
          description: `Test work order ${i + 1}`,
          scheduledDate,
          notes: 'Created for chart testing'
        };

        const workOrderId = await this.client.mutation(api.workOrders.createWorkOrder, workOrderData);

        // Update status if not Pending
        if (status !== 'Pending') {
          await this.client.mutation(api.workOrders.updateWorkOrder, {
            id: workOrderId,
            status
          });
        }

        workOrderIds.push(workOrderId);
      }

      this.results.workOrders = workOrderIds;
      console.log(`Created ${workOrderIds.length} test work orders`);
    } catch (error) {
      this.errors.push(`Error creating test work orders: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Create test invoices with various statuses
   */
  private async createTestInvoices(): Promise<void> {
    try {
      console.log("Creating test invoices...");

      if (!this.results.contacts?.length) {
        throw new Error("No contacts available for creating invoices");
      }

      const invoiceIds: string[] = [];

      for (let i = 0; i < this.config.invoices; i++) {
        const contactId = this.getRandomElement(this.results.contacts);
        const accountId = this.results.accounts?.length > 0 ?
          this.getRandomElement(this.results.accounts) : undefined;

        const status = this.getWeightedRandomStatus(this.config.invoiceStatus);
        const total = this.getRandomAmount(500, 5000);
        const issueDate = this.getRandomDate(new Date(2023, 0, 1), new Date()).getTime();
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 30);

        // For paid invoices, set a payment date
        let paidDate = null;
        if (status === 'Paid') {
          paidDate = new Date(issueDate);
          paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 30) + 1);
        }

        // Create line items
        const lineItems = [
          {
            description: "Service Package",
            quantity: Math.floor(Math.random() * 3) + 1,
            unitPrice: this.getRandomAmount(100, 1000)
          }
        ];

        const invoiceData = {
          invoiceNumber: `INV-${30000 + i}`,
          contactId,
          accountId,
          issueDate,
          dueDate: dueDate.getTime(),
          paidDate: paidDate ? paidDate.getTime() : null,
          lineItems,
          notes: 'Created for chart testing'
        };

        const invoiceId = await this.client.mutation(api.invoices.createInvoice, invoiceData);

        // Update status if not Draft
        if (status !== 'Draft') {
          await this.client.mutation(api.invoices.changeInvoiceStatus, {
            id: invoiceId,
            status
          });
        }

        invoiceIds.push(invoiceId);
      }

      this.results.invoices = invoiceIds;
      console.log(`Created ${invoiceIds.length} test invoices`);
    } catch (error) {
      this.errors.push(`Error creating test invoices: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
