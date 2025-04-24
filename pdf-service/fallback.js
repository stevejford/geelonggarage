// This file provides a fallback mechanism to use full puppeteer if puppeteer-core fails

import { findChrome } from './chrome-finder.js';

/**
 * Creates a browser instance using either puppeteer-core or full puppeteer as fallback
 */
export async function createBrowser() {
  try {
    // Try to use puppeteer-core first (faster, lighter)
    const chromePath = process.env.CHROME_BIN || findChrome();
    
    if (!chromePath) {
      console.log('No Chrome installation found, falling back to full puppeteer');
      // If no Chrome found, dynamically import full puppeteer
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
    }
    
    // Use puppeteer-core with found Chrome
    console.log(`Using Chrome executable at: ${chromePath}`);
    const puppeteerCore = await import('puppeteer-core');
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
  } catch (error) {
    console.error('Error creating browser:', error);
    throw error;
  }
}
