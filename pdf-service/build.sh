#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Chrome
echo "Installing Chrome..."
apt-get update
apt-get install -y wget gnupg
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
apt-get update
apt-get install -y google-chrome-stable

# Install dependencies
echo "Installing dependencies..."
npm install

# Install Puppeteer
echo "Installing Puppeteer..."
npm install puppeteer

# Print Chrome version
echo "Chrome version:"
google-chrome --version

# Print Node version
echo "Node version:"
node --version

# Print Puppeteer version
echo "Puppeteer version:"
npm list puppeteer
