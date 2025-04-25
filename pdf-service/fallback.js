// This file provides a browser instance for PDF generation

import puppeteer from 'puppeteer';

/**
 * Creates a browser instance using puppeteer
 */
export async function createBrowser() {
  try {
    console.log('Launching browser with puppeteer...');
    console.log('Environment:', process.env.NODE_ENV);

    // Check if we're running on Render
    const isRender = process.env.RENDER === 'true';
    console.log('Running on Render:', isRender);

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

    // If we're running on Render, use a different approach
    if (isRender) {
      console.log('Using Render-specific configuration');

      try {
        // Try to find Chrome in different locations
        const possiblePaths = [
          '/usr/bin/google-chrome-stable',
          '/usr/bin/google-chrome',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium'
        ];

        for (const path of possiblePaths) {
          const { execSync } = require('child_process');
          try {
            execSync(`${path} --version`);
            console.log(`Found Chrome at ${path}`);
            launchOptions.executablePath = path;
            break;
          } catch (e) {
            console.log(`Chrome not found at ${path}`);
          }
        }

        if (!launchOptions.executablePath) {
          console.log('No Chrome installation found, falling back to full puppeteer');
          // If we can't find Chrome, try to use the bundled Chromium
          const puppeteer = await import('puppeteer');
          console.log('Puppeteer imported successfully, launching browser...');
        }
      } catch (error) {
        console.error('Error finding Chrome:', error);
        console.log('Falling back to alternative PDF generation method...');
      }
    }

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
