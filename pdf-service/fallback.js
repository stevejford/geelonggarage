// This file provides a browser instance for PDF generation

import { findChrome } from './chrome-finder.js';

/**
 * Creates a browser instance using either puppeteer-core or full puppeteer as fallback
 */
export async function createBrowser() {
  try {
    console.log('Creating browser instance...');

    // Try to use puppeteer-core first (faster, lighter)
    const chromePath = process.env.CHROME_BIN || findChrome();

    if (!chromePath) {
      console.log('No Chrome installation found, falling back to full puppeteer');
      try {
        // If no Chrome found, dynamically import full puppeteer
        console.log('Attempting to import puppeteer...');
        const puppeteer = await import('puppeteer');
        console.log('Puppeteer imported successfully, launching browser...');
        return await puppeteer.default.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        });
      } catch (puppeteerError) {
        console.error('Error importing or launching puppeteer:', puppeteerError);

        // As a last resort, try to use a cloud-based PDF generation service
        console.log('Falling back to alternative PDF generation method...');
        return null; // Return null to indicate that browser creation failed
      }
    }

    // Use puppeteer-core with found Chrome
    console.log(`Using Chrome executable at: ${chromePath}`);
    try {
      console.log('Attempting to import puppeteer-core...');
      const puppeteerCore = await import('puppeteer-core');
      console.log('Puppeteer-core imported successfully, launching browser...');
      return await puppeteerCore.default.launch({
        headless: 'new',
        executablePath: chromePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    } catch (puppeteerCoreError) {
      console.error('Error importing or launching puppeteer-core:', puppeteerCoreError);

      // Try puppeteer as a fallback
      try {
        console.log('Falling back to puppeteer...');
        const puppeteer = await import('puppeteer');
        return await puppeteer.default.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        });
      } catch (error) {
        console.error('All browser creation methods failed:', error);
        return null; // Return null to indicate that browser creation failed
      }
    }
  } catch (error) {
    console.error('Error creating browser:', error);
    return null; // Return null to indicate that browser creation failed
  }
}
