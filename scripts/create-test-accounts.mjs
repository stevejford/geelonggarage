// Script to create test accounts using fetch directly
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Convex URL from environment
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://eager-otter-452.convex.cloud";
const CONVEX_DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY;

if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  process.exit(1);
}

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
    website: "https://acme.example.com",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    name: "Smith Family Residence",
    type: "Residential",
    address: "456 Maple Street",
    city: "Springfield",
    state: "IL",
    zip: "62701",
    notes: "Regular maintenance customer",
    createdAt: Date.now(),
    updatedAt: Date.now()
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
    website: "https://sunshine.example.com",
    createdAt: Date.now(),
    updatedAt: Date.now()
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
    website: "https://hospital.example.com",
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    name: "Johnson Apartment Building",
    type: "Residential",
    address: "202 Tower Road",
    city: "Highrise",
    state: "TX",
    zip: "75001",
    notes: "Multi-unit property",
    phoneNumber: "555-333-4444",
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// Create test accounts using npx convex run
async function createTestAccounts() {
  console.log("Creating test accounts...");
  
  for (const accountData of testAccounts) {
    try {
      // Use npx convex run to create the account
      const command = `npx convex run accounts:createAccount '${JSON.stringify(accountData)}'`;
      console.log(`Running: ${command}`);
      
      // Use child_process.exec to run the command
      const { exec } = await import('child_process');
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error creating account ${accountData.name}:`, error);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`Created account: ${accountData.name}`);
        console.log(stdout);
      });
    } catch (error) {
      console.error(`Error creating account ${accountData.name}:`, error);
    }
  }
  
  console.log("Test accounts creation initiated!");
}

// Run the script
createTestAccounts().catch(console.error);
