# PDF Generation Architecture

This document outlines the architecture and implementation details for PDF generation in the Geelong Garage application.

## Overview

The application requires PDF generation for various document types:
- Quotes
- Invoices
- Work Orders

We've implemented a hybrid approach that leverages both server-side and client-side capabilities to provide a robust, high-quality PDF generation solution.

## Primary Approach: Hybrid Server-Side Generation with Client-Side Preview

Our approach combines server-side PDF generation using Render's extended execution capabilities with client-side preview, providing both high-quality output and excellent user experience.

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  React UI   │────▶│   Convex    │────▶│   Render    │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   ▲                   │
       │                   │                   │
       ▼                   │                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│ PDF Preview │◀────│   Storage   │◀────│ PDF Service │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Components

1. **React UI**:
   - Displays document data
   - Provides preview of document
   - Initiates PDF generation
   - Shows loading state during generation
   - Handles download and sharing

2. **Convex Backend**:
   - Stores document data
   - Manages document metadata
   - Calls Render PDF service
   - Stores generated PDFs
   - Handles permissions and access control

3. **Render PDF Service**:
   - Dedicated endpoints for PDF generation
   - Uses Puppeteer for HTML-to-PDF conversion
   - Processes templates with document data
   - Returns generated PDFs
   - Handles error cases

4. **PDF Preview Component**:
   - Displays the generated PDF in the browser
   - Provides zoom and navigation controls
   - Enables download and sharing options
   - Offers a consistent user experience

5. **Storage**:
   - Convex storage for document data and metadata
   - Optional cloud storage for PDFs (S3, GCS)

### Implementation Details

#### Render PDF Service

The PDF service is implemented as a Node.js Express application running on Render with the following components:

1. **Dependencies**:
   ```json
   {
     "dependencies": {
       "express": "^4.18.2",
       "puppeteer": "^21.0.0",
       "handlebars": "^4.7.8",
       "cors": "^2.8.5"
     }
   }
   ```

2. **API Endpoints**:
   - `POST /api/pdf/generate`: Generates a PDF from provided data and template
   - `GET /api/pdf/templates`: Lists available templates
   - `GET /api/pdf/:id`: Retrieves a previously generated PDF

3. **PDF Generation Process**:
   - Receive document data and template name
   - Load HTML template
   - Compile template with Handlebars
   - Launch Puppeteer
   - Render HTML to PDF
   - Return PDF data or store and return URL

#### Convex Integration

Convex integrates with the Render PDF service through HTTP actions:

1. **PDF Generation Action**:
   - Accepts document type and ID
   - Fetches document data
   - Calls Render PDF service
   - Stores PDF in Convex storage
   - Updates document with PDF metadata

2. **PDF Retrieval Query**:
   - Fetches stored PDF by document ID
   - Handles permissions
   - Returns URL or data for download

#### React UI Components

The UI provides several components for PDF interaction:

1. **PDF Preview**:
   - Uses react-pdf to display the generated PDF
   - Provides zoom and page navigation
   - Enables download and sharing
   - Handles loading states and errors

2. **PDF Generation Button**:
   - Initiates server-side generation
   - Shows loading state
   - Handles errors

### Advantages of Hybrid Approach

1. **High-Quality Output**: Server-side generation ensures consistent, professional PDFs
2. **Excellent User Experience**: Client-side preview provides immediate feedback
3. **Extended Processing**: Render allows for longer execution times than serverless platforms
4. **Flexibility**: Can handle complex layouts and large documents
5. **Scalability**: Separate service can be scaled independently

## Document Templates

Templates are HTML files with CSS styling and Handlebars syntax for data binding.

### Template Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{documentType}} - {{documentNumber}}</title>
  <style>
    /* CSS styles for the document */
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Arial', sans-serif;
      color: #333;
    }
    /* More styles... */
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <img src="{{logoUrl}}" alt="Company Logo">
    </div>
    <div class="company-info">
      <h1>{{companyName}}</h1>
      <p>{{companyAddress}}</p>
      <!-- More company info... -->
    </div>
  </header>
  
  <main>
    <!-- Document-specific content -->
    {{#if isQuote}}
      <!-- Quote-specific template -->
    {{/if}}
    
    {{#if isInvoice}}
      <!-- Invoice-specific template -->
    {{/if}}
    
    {{#if isWorkOrder}}
      <!-- Work Order-specific template -->
    {{/if}}
  </main>
  
  <footer>
    <div class="footer-content">
      <p>{{footerText}}</p>
    </div>
    <div class="page-number">Page {{pageNumber}} of {{totalPages}}</div>
  </footer>
</body>
</html>
```

### Template Locations

- Server-side templates: `src/templates/pdfs/`
- Client-side templates: `src/components/pdf-templates/`

## Data Flow

1. User initiates PDF generation from UI
2. Application fetches document data from Convex
3. UI shows loading state during generation
4. Convex calls Render PDF service with document data
5. Render service generates PDF and returns URL or data
6. Convex stores PDF and updates document metadata
7. UI displays the PDF in the preview component
8. User can download, print, or share the PDF

## Security Considerations

1. **Authentication**: All PDF generation endpoints require authentication
2. **Authorization**: Document access is checked before generation
3. **Data Validation**: Input data is validated before processing
4. **Resource Limits**: Limits on PDF size and generation frequency
5. **Content Security**: HTML sanitization to prevent XSS in templates

## Future Enhancements

1. **Digital Signatures**: Add capability for digital signatures
2. **Batch Processing**: Generate multiple PDFs in batch
3. **Watermarking**: Add watermarks for draft documents
4. **PDF/A Compliance**: Ensure archival-quality PDFs
5. **Advanced Analytics**: Track document views and interactions

## Troubleshooting

### Server-Side Generation Issues

1. **Timeout Errors**:
   - Check Render logs for execution time
   - Optimize template rendering
   - Consider increasing Render instance size

2. **Rendering Problems**:
   - Verify HTML template validity
   - Check CSS compatibility with Puppeteer
   - Ensure all assets are accessible

3. **Memory Issues**:
   - Monitor Render memory usage
   - Optimize Puppeteer configuration
   - Consider dedicated instances for large documents

### Client-Side Preview Issues

1. **Browser Compatibility**:
   - Test across major browsers
   - Provide fallback styles
   - Consider feature detection

2. **Performance**:
   - Optimize PDF size
   - Implement progressive loading
   - Consider lazy loading for large documents

## Conclusion

This hybrid approach to PDF generation provides the best of both worlds: high-quality, consistent output from server-side generation with the excellent user experience of client-side preview. By leveraging Render's extended execution capabilities, we can provide professional-grade PDFs while maintaining a responsive and intuitive user interface.
