// Chart Test Data Generator
// This script populates the database with test data for chart visualization testing
// Run with: node scripts/chart-test-data-generator.js

const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
require('dotenv').config();

// Initialize Convex client
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Configuration
const CONFIG = {
  // Number of entities to create
  leads: 20,
  contacts: 10,
  accounts: 5,
  quotes: 15,
  workOrders: 8,
  invoices: 12,

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

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
}

function getWeightedRandomStatus(statusConfig) {
  const statuses = Object.keys(statusConfig);
  const weights = Object.values(statusConfig);

  // Calculate cumulative weights
  const cumulativeWeights = [];
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

function getRandomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPhone() {
  return `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function getRandomEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'company.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(domains)}`;
}

// Sample data
const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'William', 'Emma'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
const companyNames = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises', 'Cyberdyne Systems', 'Soylent Corp', 'Massive Dynamic', 'Oscorp'];
const leadSources = ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media'];
const productServices = ['Consulting', 'Installation', 'Maintenance', 'Repair', 'Upgrade', 'Custom Development'];

// Main function to generate test data
async function generateTestData() {
  console.log('Starting test data generation...');

  // Create accounts
  const accountIds = [];
  for (let i = 0; i < CONFIG.accounts; i++) {
    const name = companyNames[i % companyNames.length];
    try {
      const accountId = await client.mutation(api.accounts.createAccount, {
        name,
        type: 'Commercial',
        address: '123 Business St',
        city: 'Businessville',
        state: 'CA',
        zip: '90210', // Note: it's 'zip', not 'zipCode'
        notes: 'Created for chart testing'
      });
      accountIds.push(accountId);
      console.log(`Created account: ${name}`);
    } catch (error) {
      console.error(`Error creating account ${name}:`, error);
    }
  }

  // Create contacts
  const contactIds = [];
  for (let i = 0; i < CONFIG.contacts; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const accountId = accountIds.length > 0 ? getRandomElement(accountIds) : null;

    try {
      // Create contact first (without accountId)
      const contactId = await client.mutation(api.contacts.createContact, {
        firstName,
        lastName,
        email: getRandomEmail(firstName, lastName),
        phone: getRandomPhone(),
        address: `${Math.floor(Math.random() * 1000) + 100} Main St`,
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        notes: 'Created for chart testing'
      });

      // If we have an accountId, link this contact to the account
      if (accountId) {
        try {
          await client.mutation(api.accounts.linkContactToAccount, {
            contactId,
            accountId,
            relationship: 'Customer',
            isPrimary: Math.random() > 0.7 // 30% chance of being primary
          });
        } catch (linkError) {
          console.warn(`Could not link contact to account: ${linkError}`);
        }
      }
      contactIds.push(contactId);
      console.log(`Created contact: ${firstName} ${lastName}`);
    } catch (error) {
      console.error(`Error creating contact ${firstName} ${lastName}:`, error);
    }
  }

  // Create leads
  const leadIds = [];
  for (let i = 0; i < CONFIG.leads; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const status = getWeightedRandomStatus(CONFIG.leadStatus);

    try {
      const leadId = await client.mutation(api.leads.createLead, {
        name,
        email: getRandomEmail(firstName, lastName),
        phone: getRandomPhone(),
        source: getRandomElement(leadSources),
        status,
        notes: 'Created for chart testing'
      });
      leadIds.push(leadId);
      console.log(`Created lead: ${name} (${status})`);
    } catch (error) {
      console.error(`Error creating lead ${name}:`, error);
    }
  }

  // Create quotes
  const quoteIds = [];
  for (let i = 0; i < CONFIG.quotes; i++) {
    const contactId = contactIds.length > 0 ? getRandomElement(contactIds) : null;
    const accountId = contactIds.length > 0 && contactId ?
      (await client.query(api.contacts.getContact, { id: contactId })).accountId :
      (accountIds.length > 0 ? getRandomElement(accountIds) : null);

    const status = getWeightedRandomStatus(CONFIG.quoteStatus);
    const total = getRandomAmount(500, 5000);
    const issueDate = getRandomDate(new Date(2023, 0, 1), new Date());
    const expiryDate = new Date(issueDate);
    expiryDate.setDate(expiryDate.getDate() + 30);

    try {
      // Create quote with only the fields expected by the API
      const quoteId = await client.mutation(api.quotes.createQuote, {
        contactId,
        accountId,
        issueDate: issueDate.getTime(),
        expiryDate: expiryDate.getTime(),
        lineItems: [
          {
            description: getRandomElement(productServices),
            quantity: Math.floor(Math.random() * 5) + 1,
            unitPrice: getRandomAmount(100, 1000)
          }
        ],
        notes: 'Created for chart testing'
      });

      // Update status if not Draft
      if (status !== 'Draft') {
        await client.mutation(api.quotes.changeQuoteStatus, {
          id: quoteId,
          status
        });
      }
      quoteIds.push(quoteId);
      console.log(`Created quote: Q-${10000 + i} (${status})`);
    } catch (error) {
      console.error(`Error creating quote Q-${10000 + i}:`, error);
    }
  }

  // Create work orders
  const workOrderIds = [];
  for (let i = 0; i < CONFIG.workOrders; i++) {
    const contactId = contactIds.length > 0 ? getRandomElement(contactIds) : null;
    const accountId = contactIds.length > 0 && contactId ?
      (await client.query(api.contacts.getContact, { id: contactId })).accountId :
      (accountIds.length > 0 ? getRandomElement(accountIds) : null);

    const status = getWeightedRandomStatus(CONFIG.workOrderStatus);
    const scheduledDate = getRandomDate(new Date(2023, 0, 1), new Date(2023, 11, 31));

    try {
      const workOrderId = await client.mutation(api.workOrders.createWorkOrder, {
        workOrderNumber: `WO-${20000 + i}`,
        contactId,
        accountId,
        description: `${getRandomElement(productServices)} service`,
        status,
        scheduledDate: scheduledDate.getTime(),
        notes: 'Created for chart testing'
      });
      workOrderIds.push(workOrderId);
      console.log(`Created work order: WO-${20000 + i} (${status})`);
    } catch (error) {
      console.error(`Error creating work order WO-${20000 + i}:`, error);
    }
  }

  // Create invoices
  const invoiceIds = [];
  for (let i = 0; i < CONFIG.invoices; i++) {
    const contactId = contactIds.length > 0 ? getRandomElement(contactIds) : null;
    const accountId = contactIds.length > 0 && contactId ?
      (await client.query(api.contacts.getContact, { id: contactId })).accountId :
      (accountIds.length > 0 ? getRandomElement(accountIds) : null);

    const status = getWeightedRandomStatus(CONFIG.invoiceStatus);
    const total = getRandomAmount(500, 5000);
    const issueDate = getRandomDate(new Date(2023, 0, 1), new Date());
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // For paid invoices, set a payment date
    let paidDate = null;
    if (status === 'Paid') {
      paidDate = new Date(issueDate);
      paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 30) + 1);
    }

    try {
      const invoiceId = await client.mutation(api.invoices.createInvoice, {
        invoiceNumber: `INV-${30000 + i}`,
        contactId,
        accountId,
        issueDate: issueDate.getTime(),
        dueDate: dueDate.getTime(),
        paidDate: paidDate ? paidDate.getTime() : null,
        status,
        items: [
          {
            description: getRandomElement(productServices),
            quantity: Math.floor(Math.random() * 5) + 1,
            unitPrice: getRandomAmount(100, 1000),
            total: total
          }
        ],
        subtotal: total,
        tax: Math.round(total * 0.1),
        total: Math.round(total * 1.1),
        notes: 'Created for chart testing'
      });
      invoiceIds.push(invoiceId);
      console.log(`Created invoice: INV-${30000 + i} (${status})`);
    } catch (error) {
      console.error(`Error creating invoice INV-${30000 + i}:`, error);
    }
  }

  console.log('Test data generation complete!');
  console.log(`Created: ${accountIds.length} accounts, ${contactIds.length} contacts, ${leadIds.length} leads, ${quoteIds.length} quotes, ${workOrderIds.length} work orders, ${invoiceIds.length} invoices`);
}

// Run the script
generateTestData().catch(console.error);
