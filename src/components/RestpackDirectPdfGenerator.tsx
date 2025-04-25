import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface RestpackDirectPdfGeneratorProps {
  templateName: string;
  templateData: any;
  buttonText?: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onPdfGenerated?: (url: string) => void;
}

const RestpackDirectPdfGenerator: React.FC<RestpackDirectPdfGeneratorProps> = ({
  templateName,
  templateData,
  buttonText = 'Generate PDF',
  className = '',
  variant = 'default',
  onPdfGenerated,
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      console.log(`Preparing to generate PDF with template: ${templateName}`);

      // Create HTML content from template data
      const htmlContent = generateHtmlFromTemplate(templateName, templateData);

      // Convert HTML to PDF using Restpack API directly
      console.log('Converting HTML to PDF using Restpack API...');

      // Let's try a simpler approach first with just a URL to test the API
      const useSimpleTest = false; // Set to true to test with a simple URL instead of HTML content

      const requestData = useSimpleTest ? {
        url: 'https://google.com',
        pdf_page: 'A4',
        pdf_orientation: 'portrait',
        pdf_margins: '10px',
        json: true
      } : {
        html: htmlContent,
        pdf_page: 'A4',
        pdf_orientation: 'portrait',
        pdf_margins: '10px', // Using a valid format as per the error message
        json: true
      };

      // Log the request for debugging
      console.log('Restpack API request:', {
        url: 'https://restpack.io/api/html2pdf/v7/convert',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': 'G6CVGSyR9DKEIEXPDhv8WdIRjq4MreFsP8XV6UzXEyQmuQSe'
        },
        body: JSON.stringify(requestData)
      });

      const response = await fetch('https://restpack.io/api/html2pdf/v7/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': 'G6CVGSyR9DKEIEXPDhv8WdIRjq4MreFsP8XV6UzXEyQmuQSe'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Restpack API error response:', errorText);
        throw new Error(`PDF generation failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Restpack API response:', result);

      // Check if the response contains an image URL
      if (!result.image) {
        throw new Error('No PDF URL returned from the API');
      }

      // Open the PDF URL in a new tab
      try {
        window.open(result.image, '_blank');
      } catch (error) {
        console.error('Error opening PDF URL:', error);
        // Provide a fallback by showing the URL to the user
        toast({
          title: 'PDF Generated',
          description: `Your PDF is available at: ${result.image}`,
          variant: 'default',
        });
      }

      // Call the onPdfGenerated callback if provided
      if (onPdfGenerated) {
        onPdfGenerated(result.image);
      }

      toast({
        title: 'PDF Generated',
        description: 'Your PDF has been generated successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: `Failed to generate PDF: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to generate HTML from template data
  const generateHtmlFromTemplate = (templateName: string, data: any): string => {
    // Enhanced HTML template with better styling
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.company_name || 'Geelong Garage'} - ${templateName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary-color: #2563eb;
            --primary-dark: #1d4ed8;
            --secondary-color: #475569;
            --accent-color: #f59e0b;
            --success-color: #10b981;
            --warning-color: #f97316;
            --danger-color: #ef4444;
            --light-gray: #f8fafc;
            --border-color: #e2e8f0;
            --text-color: #334155;
            --text-light: #64748b;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: white;
            font-size: 14px;
            padding: 0;
            margin: 0;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 15px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
          }

          .logo-container {
            flex: 1;
          }

          .logo {
            max-width: 200px;
            height: auto;
          }

          .company-info {
            text-align: right;
            flex: 1;
          }

          .company-name {
            font-size: 22px;
            font-weight: 700;
            color: var(--primary-dark);
            margin-bottom: 5px;
          }

          .company-details {
            font-size: 12px;
            color: var(--secondary-color);
            line-height: 1.3;
          }

          .document-title {
            text-align: center;
            margin: 15px 0;
            position: relative;
          }

          .document-title h1 {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-color);
            display: inline-block;
            padding: 0 15px;
            background: white;
            position: relative;
            z-index: 1;
          }

          .document-title::after {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 100%;
            height: 1px;
            background-color: var(--border-color);
            z-index: 0;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }

          .info-section {
            padding: 12px;
            background-color: var(--light-gray);
            border-radius: 6px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }

          .info-section h3 {
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--border-color);
          }

          .info-row {
            display: flex;
            margin-bottom: 4px;
            font-size: 12px;
          }

          .info-label {
            font-weight: 600;
            width: 110px;
            color: var(--secondary-color);
          }

          .info-value {
            flex: 1;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            border-radius: 6px;
            overflow: hidden;
            font-size: 12px;
          }

          thead {
            background-color: var(--primary-color);
            color: white;
          }

          th {
            padding: 8px 10px;
            text-align: left;
            font-weight: 600;
          }

          td {
            padding: 6px 10px;
            border-bottom: 1px solid var(--border-color);
          }

          tr:nth-child(even) {
            background-color: var(--light-gray);
          }

          tr:last-child td {
            border-bottom: none;
          }

          .totals-container {
            margin-top: 10px;
            width: 220px;
            font-size: 12px;
          }

          .totals-row {
            display: flex;
            padding: 4px 0;
            border-bottom: 1px solid var(--border-color);
          }

          .totals-row:last-child {
            border-bottom: none;
            font-weight: 700;
            font-size: 14px;
            color: var(--primary-dark);
            padding-top: 6px;
          }

          .payment-info {
            margin-top: 15px;
            padding: 12px;
            background-color: var(--light-gray);
            border-radius: 6px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            font-size: 12px;
          }

          .payment-info h3 {
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--border-color);
          }

          .payment-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 10px;
            text-transform: uppercase;
          }

          .status-completed {
            background-color: #d1fae5;
            color: #065f46;
          }

          .status-pending {
            background-color: #ffedd5;
            color: #9a3412;
          }

          .status-in-progress {
            background-color: #dbeafe;
            color: #1e40af;
          }

          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid var(--border-color);
            text-align: center;
            font-size: 10px;
            color: var(--text-light);
          }

          .notes-section {
            margin-top: 15px;
            padding: 12px;
            background-color: var(--light-gray);
            border-radius: 6px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            font-size: 12px;
          }

          .notes-section h3 {
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--border-color);
          }

          .technicians-list {
            list-style-type: none;
            margin-top: 8px;
          }

          .technicians-list li {
            padding: 3px 0;
            border-bottom: 1px dashed var(--border-color);
          }

          .technicians-list li:last-child {
            border-bottom: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-container">
              <img src="https://geelonggaragedoors.com.au/wp-content/uploads/2023/06/logo-pdfs.png" alt="Geelong Garage Logo" class="logo">
            </div>
            <div class="company-info">
              <div class="company-name">Geelong Garage</div>
              <div class="company-details">
                31 Gordon Ave<br>
                Geelong West VIC 3218<br>
                Phone: (03) 5221 9222<br>
                Email: admin@geelonggaragedoors.com.au
              </div>
            </div>
          </div>

          <div class="document-title">
            <h1>${templateName === 'invoice_template' ? 'INVOICE' :
              templateName === 'quote_template' ? 'QUOTE' : 'WORK ORDER'}</h1>
          </div>

          <div class="info-grid">
            <div class="info-section">
              <h3>Customer Information</h3>
              <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${data.customer_name || 'Customer Name'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Address:</div>
                <div class="info-value">${data.customer_address_line1 || 'Customer Address'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value">${data.customer_phone || 'Customer Phone'}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${data.customer_email || 'Customer Email'}</div>
              </div>
            </div>

            <div class="info-section">
              ${templateName === 'invoice_template' ? `
                <h3>Invoice Details</h3>
                <div class="info-row">
                  <div class="info-label">Invoice Number:</div>
                  <div class="info-value">${data.invoice_number || 'INV-001'}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Invoice Date:</div>
                  <div class="info-value">${data.invoice_date || new Date().toLocaleDateString()}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Due Date:</div>
                  <div class="info-value">${data.due_date || new Date().toLocaleDateString()}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Work Order:</div>
                  <div class="info-value">${data.work_order_number || 'WO-001'}</div>
                </div>
              ` : templateName === 'quote_template' ? `
                <h3>Quote Details</h3>
                <div class="info-row">
                  <div class="info-label">Quote Number:</div>
                  <div class="info-value">${data.quote_number || 'Q-001'}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Quote Date:</div>
                  <div class="info-value">${data.quote_date || new Date().toLocaleDateString()}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Expiry Date:</div>
                  <div class="info-value">${data.expiry_date || new Date().toLocaleDateString()}</div>
                </div>
              ` : `
                <h3>Work Order Details</h3>
                <div class="info-row">
                  <div class="info-label">Work Order:</div>
                  <div class="info-value">${data.work_order_number || 'WO-001'}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Created Date:</div>
                  <div class="info-value">${data.created_date || new Date().toLocaleDateString()}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Scheduled Date:</div>
                  <div class="info-value">${data.scheduled_date || new Date().toLocaleDateString()}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Status:</div>
                  <div class="info-value">
                    <span class="status-badge status-${data.status_class || 'pending'}">${data.status || 'Pending'}</span>
                  </div>
                </div>
              `}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 10%">Quantity</th>
                <th style="width: 45%">Description</th>
                <th style="width: 15%">Unit Price</th>
                <th style="width: 15%">GST</th>
                <th style="width: 15%; text-align: right; padding-right: 15px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(data.line_items || []).map(item => {
                const unitPrice = parseFloat(item.unit_price);
                const quantity = parseInt(item.quantity);
                const gstAmount = (unitPrice * quantity * 0.1).toFixed(2);
                return `
                <tr>
                  <td>${item.quantity}</td>
                  <td>${item.description}</td>
                  <td>$${item.unit_price}</td>
                  <td>$${gstAmount}</td>
                  <td style="text-align: right; padding-right: 15px;">$${item.total}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end; padding-right: 15px;">
            <table style="width: 250px; border-collapse: collapse; margin: 0; box-shadow: none;">
              <tr>
                <td style="text-align: right; padding: 4px 10px 4px 0; border: none;">Subtotal</td>
                <td style="text-align: right; width: 100px; padding: 4px 0; border: none;">$${data.subtotal || '0.00'}</td>
              </tr>
              <tr>
                <td style="text-align: right; padding: 4px 10px 4px 0; border: none;">Tax</td>
                <td style="text-align: right; width: 100px; padding: 4px 0; border: none;">$${data.tax || '0.00'}</td>
              </tr>
              <tr>
                <td style="text-align: right; padding: 8px 10px 4px 0; border-top: 1px solid var(--border-color); border-bottom: none; border-left: none; border-right: none; font-weight: 700;">Total</td>
                <td style="text-align: right; width: 100px; padding: 8px 0 4px 0; border-top: 1px solid var(--border-color); border-bottom: none; border-left: none; border-right: none; font-weight: 700;">$${data.total || '0.00'}</td>
              </tr>
            </table>
          </div>

          ${templateName === 'invoice_template' ? `
            <div class="payment-info">
              <h3>Payment Information</h3>
              <div class="payment-grid">
                <div class="info-row">
                  <div class="info-label">Bank Name:</div>
                  <div class="info-value">Commonwealth Bank of Australia</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Account Name:</div>
                  <div class="info-value">Geelong Garage Pty Ltd</div>
                </div>
                <div class="info-row">
                  <div class="info-label">BSB:</div>
                  <div class="info-value">063-000</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Account Number:</div>
                  <div class="info-value">12345678</div>
                </div>
              </div>
            </div>
          ` : templateName === 'work_order_template' ? `
            <div class="notes-section">
              <h3>Notes</h3>
              <p>${data.notes || 'No notes provided.'}</p>

              <h3 style="margin-top: 20px;">Technicians</h3>
              <ul class="technicians-list">
                ${(data.technicians || []).map(tech => `<li>${tech.name}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} | Geelong Garage</p>
            <p>31 Gordon Ave, Geelong West VIC 3218 | Phone: (03) 5221 9222 | Fax: (03) 5222 6186</p>
            <p>Office Hours: Mon-Fri 9am-4:30pm | Email: admin@geelonggaragedoors.com.au</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Button
      onClick={handleGeneratePdf}
      disabled={isGenerating}
      className={className}
      variant={variant}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
};

export default RestpackDirectPdfGenerator;
