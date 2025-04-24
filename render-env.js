// This file is used by Render to set environment variables
// It's executed during the build process

console.log('Setting up environment variables for Render deployment...');

// Update the .env file with the correct Convex URL
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the .env file
const envPath = path.join(__dirname, '.env');

// Read the current .env file
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('Error reading .env file:', error);
  process.exit(1);
}

// Replace the Convex URL
const updatedEnvContent = envContent.replace(
  /VITE_CONVEX_URL=.*/,
  'VITE_CONVEX_URL=https://grandiose-swordfish-144.convex.cloud'
);

// Write the updated .env file
try {
  fs.writeFileSync(envPath, updatedEnvContent);
  console.log('Successfully updated Convex URL in .env file');
} catch (error) {
  console.error('Error writing .env file:', error);
  process.exit(1);
}

console.log('Environment setup complete!');
