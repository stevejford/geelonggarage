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
}

const RestpackDirectPdfGenerator: React.FC<RestpackDirectPdfGeneratorProps> = ({
  templateName,
  templateData,
  buttonText = 'Generate PDF',
  className = '',
  variant = 'default',
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
    // Basic HTML template with styling
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.company_name || 'Geelong Garage'} - ${templateName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 150px;
          }
          .company-info {
            text-align: right;
          }
          .document-title {
            text-align: center;
            margin: 20px 0;
            font-size: 24px;
            color: #2563eb;
          }
          .customer-info {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .totals {
            margin-top: 20px;
            text-align: right;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
          }
          .completed {
            background-color: #dcfce7;
            color: #166534;
          }
          .pending {
            background-color: #ffedd5;
            color: #9a3412;
          }
          .in-progress {
            background-color: #dbeafe;
            color: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <img src="${data.logo_url || 'https://via.placeholder.com/150'}" alt="Logo" class="logo">
          </div>
          <div class="company-info">
            <h2>${data.company_name || 'Geelong Garage'}</h2>
            <p>${data.company_address_line1 || '123 Main Street'}</p>
            <p>${data.company_address_line2 || 'Geelong, VIC 3220'}</p>
            <p>Phone: ${data.company_phone || '(03) 5222 1234'}</p>
            <p>Email: ${data.company_email || 'info@geelonggarage.com'}</p>
          </div>
        </div>

        <div class="document-title">
          ${templateName === 'invoice_template' ? 'INVOICE' :
            templateName === 'quote_template' ? 'QUOTE' : 'WORK ORDER'}
        </div>

        <div class="customer-info">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${data.customer_name || 'Customer Name'}</p>
          <p><strong>Address:</strong> ${data.customer_address_line1 || 'Customer Address'}</p>
          <p><strong>Phone:</strong> ${data.customer_phone || 'Customer Phone'}</p>
          <p><strong>Email:</strong> ${data.customer_email || 'Customer Email'}</p>
        </div>

        ${templateName === 'invoice_template' ? `
          <div>
            <p><strong>Invoice Number:</strong> ${data.invoice_number || 'INV-001'}</p>
            <p><strong>Invoice Date:</strong> ${data.invoice_date || new Date().toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${data.due_date || new Date().toLocaleDateString()}</p>
            <p><strong>Work Order Number:</strong> ${data.work_order_number || 'WO-001'}</p>
          </div>
        ` : templateName === 'quote_template' ? `
          <div>
            <p><strong>Quote Number:</strong> ${data.quote_number || 'Q-001'}</p>
            <p><strong>Quote Date:</strong> ${data.quote_date || new Date().toLocaleDateString()}</p>
            <p><strong>Expiry Date:</strong> ${data.expiry_date || new Date().toLocaleDateString()}</p>
          </div>
        ` : `
          <div>
            <p><strong>Work Order Number:</strong> ${data.work_order_number || 'WO-001'}</p>
            <p><strong>Created Date:</strong> ${data.created_date || new Date().toLocaleDateString()}</p>
            <p><strong>Scheduled Date:</strong> ${data.scheduled_date || new Date().toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status ${data.status_class || 'pending'}">${data.status || 'Pending'}</span></p>
          </div>
        `}

        <table>
          <thead>
            <tr>
              <th>Quantity</th>
              <th>Description</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${(data.line_items || []).map(item => `
              <tr>
                <td>${item.quantity}</td>
                <td>${item.description}</td>
                <td>$${item.unit_price}</td>
                <td>$${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal:</strong> $${data.subtotal || '0.00'}</p>
          <p><strong>Tax:</strong> $${data.tax || '0.00'}</p>
          <p><strong>Total:</strong> $${data.total || '0.00'}</p>
        </div>

        ${templateName === 'invoice_template' ? `
          <div>
            <h3>Payment Information</h3>
            <p><strong>Bank Name:</strong> ${data.company_bank_name || 'Commonwealth Bank of Australia'}</p>
            <p><strong>Account Name:</strong> ${data.company_account_name || 'Geelong Garage Pty Ltd'}</p>
            <p><strong>BSB:</strong> ${data.company_bsb || '063-000'}</p>
            <p><strong>Account Number:</strong> ${data.company_account_number || '12345678'}</p>
          </div>
        ` : templateName === 'work_order_template' ? `
          <div>
            <h3>Notes</h3>
            <p>${data.notes || 'No notes provided.'}</p>

            <h3>Technicians</h3>
            <ul>
              ${(data.technicians || []).map(tech => `<li>${tech.name}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} | ${data.company_name || 'Geelong Garage'}</p>
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
