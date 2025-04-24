// This file provides a browser instance for PDF generation

import puppeteer from 'puppeteer';

/**
 * Creates a browser instance using puppeteer
 */
export async function createBrowser() {
  try {
    console.log('Launching browser with puppeteer...');

    // Launch puppeteer with appropriate options
    return await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
  } catch (error) {
    console.error('Error creating browser:', error);
    console.error('Error details:', error.message);
    throw new Error(`Failed to create browser: ${error.message}`);
  }
}
