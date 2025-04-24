// Script to create test accounts
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Initialize Convex client
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://eager-otter-452.convex.cloud");

// Sample data
const testAccounts = [
  {
    name: "Acme Corporation",
    type: "Commercial",
    address: "123 Business Ave",
    city: "Metropolis",
    state: "NY",
    zip: "10001",
    notes: "Large enterprise client",
    businessCategory: "Manufacturing",
    phoneNumber: "555-123-4567",
    website: "https://acme.example.com"
  },
  {
    name: "Smith Family Residence",
    type: "Residential",
    address: "456 Maple Street",
    city: "Springfield",
    state: "IL",
    zip: "62701",
    notes: "Regular maintenance customer"
  },
  {
    name: "Sunshine Cafe",
    type: "Commercial",
    address: "789 Beach Blvd",
    city: "Oceanview",
    state: "CA",
    zip: "90210",
    notes: "Small business client",
    businessCategory: "Food & Beverage",
    phoneNumber: "555-987-6543",
    website: "https://sunshine.example.com"
  },
  {
    name: "City Hospital",
    type: "Commercial",
    address: "101 Health Way",
    city: "Wellness",
    state: "WA",
    zip: "98001",
    notes: "Critical infrastructure client",
    businessCategory: "Healthcare",
    phoneNumber: "555-111-2222",
    website: "https://hospital.example.com"
  },
  {
    name: "Johnson Apartment Building",
    type: "Residential",
    address: "202 Tower Road",
    city: "Highrise",
    state: "TX",
    zip: "75001",
    notes: "Multi-unit property",
    phoneNumber: "555-333-4444"
  }
];

// Create test accounts
async function createTestAccounts() {
  console.log("Creating test accounts...");

  for (const accountData of testAccounts) {
    try {
      const accountId = await client.mutation(api.accounts.createAccount, accountData);
      console.log(`Created account: ${accountData.name} (ID: ${accountId})`);
    } catch (error) {
      console.error(`Error creating account ${accountData.name}:`, error);
    }
  }

  console.log("Test accounts creation complete!");
}

// Run the script
createTestAccounts().catch(console.error);
