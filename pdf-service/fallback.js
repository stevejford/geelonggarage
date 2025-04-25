// This file provides a browser instance for PDF generation

import puppeteer from 'puppeteer';

/**
 * Creates a browser instance using puppeteer
 */
export async function createBrowser() {
  try {
    console.log('Creating browser instance...');

    // Launch options
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ]
    };

    // Launch the browser
    console.log('Launch options:', JSON.stringify(launchOptions));
    const browser = await puppeteer.launch(launchOptions);
    console.log('Browser launched successfully');

    return browser;
  } catch (error) {
    console.error('Error creating browser:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);

    // Log system information
    console.log('Node version:', process.version);
    console.log('Platform:', process.platform);
    console.log('Architecture:', process.arch);

    // Return null to indicate that browser creation failed
    return null;
  }
}
