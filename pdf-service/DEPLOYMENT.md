# Deploying the PDF Service to Render

This guide explains how to deploy the Geelong Garage PDF Service to Render.

## Prerequisites

1. A Render account (https://render.com)
2. A GitHub repository containing the PDF service code

## Deployment Steps

### 1. Push the PDF Service to GitHub

First, push the PDF service code to your GitHub repository:

```bash
# Navigate to the pdf-service directory
cd pdf-service

# Initialize a Git repository if not already done
git init

# Add all files
git add .

# Commit the changes
git commit -m "Initial commit of PDF service"

# Add your GitHub repository as a remote
git remote add origin https://github.com/yourusername/pdf-service.git

# Push to GitHub
git push -u origin main
```

### 2. Create a New Web Service on Render

1. Log in to your Render account
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Select the repository containing the PDF service
5. Configure the service:
   - **Name**: geelong-garage-pdf-service
   - **Environment**: Node
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Plan**: Free (or select a paid plan for production)

### 3. Configure Environment Variables

Add the following environment variables:

- **PORT**: 3001
- **API_KEY**: A secure random string (e.g., generate with `openssl rand -hex 32`)
- **ALLOWED_ORIGINS**: Comma-separated list of allowed origins (e.g., `https://your-convex-app.convex.site,http://localhost:5173`)

### 4. Deploy the Service

Click "Create Web Service" to deploy the PDF service.

### 5. Update Convex Environment Variables

Once the PDF service is deployed, update your Convex environment variables:

1. Go to your Convex dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add the following variables:
   - **PDF_SERVICE_URL**: The URL of your Render service (e.g., `https://geelong-garage-pdf-service.onrender.com`)
   - **PDF_SERVICE_API_KEY**: The same API key you set in the Render environment variables

### 6. Test the Integration

1. Go to your application
2. Navigate to a quote, invoice, or work order
3. Click "Generate PDF"
4. Verify that the PDF is generated correctly

## Troubleshooting

### PDF Generation Fails

1. Check the Render logs for any errors
2. Verify that the API key is set correctly in both Render and Convex
3. Check that the allowed origins include your application's domain

### CORS Errors

If you see CORS errors in the browser console:

1. Verify that the `ALLOWED_ORIGINS` environment variable includes your application's domain
2. Check that the request is coming from an allowed origin

### Template Not Found

If you see "Template not found" errors:

1. Verify that the templates are correctly deployed to Render
2. Check that the template names match between the Convex code and the PDF service

## Monitoring and Scaling

- Monitor the PDF service's performance in the Render dashboard
- Upgrade to a paid plan if you need more resources
- Consider setting up auto-scaling for production workloads
