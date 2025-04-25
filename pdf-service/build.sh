#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
echo "Installing dependencies..."
npm install

# Set Puppeteer cache directory
export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer

# Install Puppeteer with Chromium
echo "Installing Puppeteer with Chromium..."
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false npm install puppeteer

# Print Node version
echo "Node version:"
node --version

# Print Puppeteer version
echo "Puppeteer version:"
npm list puppeteer

# Print Chromium path
echo "Checking for Chromium..."
node -e "console.log(require('puppeteer').executablePath())"
