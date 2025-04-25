#!/bin/bash
set -e

# Clone the repository
echo "Cloning repository..."
git clone https://github.com/stevejford/geelonggarage.git /tmp/repo

# Copy the PDF service code
echo "Copying PDF service code..."
cp -r /tmp/repo/pdf-service/* /app/

# Install dependencies
echo "Installing dependencies..."
cd /app
npm install --only=production

# Start the server
echo "Starting server..."
node index.js
