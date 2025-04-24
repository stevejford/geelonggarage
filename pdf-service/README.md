# Geelong Garage PDF Service

This service provides PDF generation capabilities for the Geelong Garage application.

## Features

- Generate PDFs from HTML templates
- Support for quotes, invoices, and work orders
- Handlebars templating for dynamic content
- RESTful API for integration with Convex

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=3001
   API_KEY=your-secret-api-key
   ALLOWED_ORIGINS=https://your-convex-app.convex.site,http://localhost:5173
   ```

3. Create the `templates` directory and add your HTML templates.

## Running the Service

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### Generate PDF
```
POST /api/pdf/generate
```

Request body:
```json
{
  "templateName": "quote_template",
  "templateData": {
    "company_name": "Geelong Garage",
    "quote_number": "Q-12345",
    "customer_name": "John Doe",
    ...
  },
  "options": {
    "format": "A4",
    "margin": {
      "top": "10mm",
      "right": "10mm",
      "bottom": "10mm",
      "left": "10mm"
    }
  }
}
```

### List Templates
```
GET /api/pdf/templates
```

Response:
```json
{
  "templates": ["quote_template", "invoice_template", "work_order_template"]
}
```

## Deployment

This service is designed to be deployed on Render.com.

1. Push the code to your GitHub repository
2. Create a new Web Service on Render
3. Connect to your GitHub repository
4. Set the build command: `npm install`
5. Set the start command: `npm start`
6. Add the environment variables from your `.env` file

## Security

- API key authentication for all endpoints
- CORS protection with allowed origins
- Input validation for all requests
