import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import { createBrowser } from './fallback.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'https://patient-tern-95.convex.site', 'https://grandiose-swordfish-144.convex.site'];

console.log('Allowed origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`Origin ${origin} not allowed by CORS`);
      return callback(null, true); // Temporarily allow all origins for debugging
    }

    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Register Handlebars helpers
Handlebars.registerHelper('formatCurrency', function(value) {
  return parseFloat(value).toFixed(2);
});

Handlebars.registerHelper('formatDate', function(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

// Routes
app.get('/', (req, res) => {
  res.send('Geelong Garage PDF Service is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Handle OPTIONS requests for CORS preflight
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
});

// Generate PDF endpoint
app.post('/api/pdf/generate', async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const { templateName, templateData, options } = req.body;

    if (!templateName || !templateData) {
      return res.status(400).json({
        success: false,
        error: 'Template name and data are required'
      });
    }

    // Generate the PDF
    const pdfBuffer = await generatePDF(templateName, templateData, options);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${templateName}.pdf"`);

    // Send the PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate PDF'
    });
  }
});

// List templates endpoint
app.get('/api/pdf/templates', (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const templates = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('.html'))
      .map(file => file.replace('.html', ''));

    res.json({ templates });
  } catch (error) {
    console.error('Error listing templates:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list templates'
    });
  }
});

// Function to generate PDF
async function generatePDF(templateName, data, options = {}) {
  // Create a browser instance using our fallback mechanism
  const browser = await createBrowser();

  // If browser creation failed, return an error
  if (!browser) {
    throw new Error('Failed to create browser instance. Please try again later.');
  }

  try {
    // Create a new page
    const page = await browser.newPage();

    // Read the template file
    const templatePath = path.join(templatesDir, `${templateName}.html`);
    let templateHtml;

    try {
      templateHtml = fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Compile the template with Handlebars
    const template = Handlebars.compile(templateHtml);
    const html = template(data);

    // Set the page content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: true,
      margin: options.margin || {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    return pdfBuffer;
  } finally {
    // Close the browser if it exists
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`PDF Service running on port ${PORT}`);
});
