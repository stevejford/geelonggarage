import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SendInvoiceEmailProps {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  pdfUrl?: string;
  lastSentAt?: number;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  onPdfNeeded?: () => Promise<string>;
  userId?: string;
}

const SendInvoiceEmail: React.FC<SendInvoiceEmailProps> = ({
  invoiceId,
  invoiceNumber,
  customerName,
  customerEmail,
  total,
  pdfUrl,
  lastSentAt,
  variant = 'default',
  onPdfNeeded,
  userId,
}) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(customerEmail || '');
  const [subject, setSubject] = useState(`Invoice #${invoiceNumber} from Geelong Garage`);
  const [message, setMessage] = useState(
    `Dear ${customerName},\n\nPlease find attached your invoice #${invoiceNumber} for $${total.toFixed(2)}.\n\nIf you have any questions, please don't hesitate to contact us.\n\nThank you for your business.\n\nBest regards,\nGeelong Garage\n\nPhone: (03) 5221 9222\nEmail: admin@geelonggaragedoors.com.au`
  );

  const sendEmail = useAction(api.email.sendEmail);
  const recordEmailHistory = useMutation(api.emailHistoryMutations.recordEmailHistory);

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSending(true);

      // If we don't have a PDF URL and onPdfNeeded is provided, generate the PDF
      let finalPdfUrl = pdfUrl;
      if (!finalPdfUrl && onPdfNeeded) {
        try {
          toast({
            title: 'Generating PDF',
            description: 'Preparing invoice PDF before sending...',
          });
          finalPdfUrl = await onPdfNeeded();
        } catch (error) {
          console.error('Error generating PDF:', error);
          toast({
            title: 'Error',
            description: 'Failed to generate PDF. Please try again.',
            variant: 'destructive',
          });
          setIsSending(false);
          return;
        }
      }

      if (!finalPdfUrl) {
        toast({
          title: 'Error',
          description: 'No PDF available to send. Please generate a PDF first.',
          variant: 'destructive',
        });
        setIsSending(false);
        return;
      }

      // Create HTML email content
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <img src="https://geelonggaragedoors.com.au/wp-content/uploads/2023/06/logo-pdfs.png" alt="Geelong Garage Logo" style="max-width: 200px; height: auto;">
          </div>
          <div style="padding: 20px; border: 1px solid #e9ecef; border-top: none;">
            <h2 style="color: #3b82f6;">Invoice #${invoiceNumber}</h2>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <p style="margin-top: 30px;">
              <a href="${finalPdfUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Invoice</a>
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d;">
              <p>31 Gordon Ave, Geelong West VIC 3218 | Phone: (03) 5221 9222 | Fax: (03) 5222 6186</p>
              <p>Office Hours: Mon-Fri 9am-4:30pm | Email: admin@geelonggaragedoors.com.au</p>
            </div>
          </div>
        </div>
      `;

      // Send the email with document tracking information
      const result = await sendEmail({
        to: email,
        subject: subject,
        html: htmlContent,
        documentType: 'invoice',
        documentId: invoiceId,
        message: message,
        pdfUrl: finalPdfUrl,
        sentBy: userId,
      });

      if (result.success) {
        // Record email history if document info is returned
        if (result.documentInfo) {
          await recordEmailHistory({
            documentType: result.documentInfo.documentType,
            documentId: result.documentInfo.documentId,
            recipientEmail: result.documentInfo.recipientEmail,
            subject: result.documentInfo.subject,
            message: result.documentInfo.message,
            pdfUrl: result.documentInfo.pdfUrl,
            sentAt: result.documentInfo.sentAt,
            sentBy: result.documentInfo.sentBy,
            status: result.documentInfo.status,
          });
        }

        toast({
          title: 'Email Sent',
          description: `Invoice has been sent to ${email}`,
        });
        setIsOpen(false);
      } else {
        // Record failed email if document info is returned
        if (result.documentInfo) {
          await recordEmailHistory({
            documentType: result.documentInfo.documentType,
            documentId: result.documentInfo.documentId,
            recipientEmail: result.documentInfo.recipientEmail,
            subject: result.documentInfo.subject,
            message: result.documentInfo.message,
            pdfUrl: result.documentInfo.pdfUrl,
            sentAt: result.documentInfo.sentAt,
            sentBy: result.documentInfo.sentBy,
            status: result.documentInfo.status,
            errorMessage: result.documentInfo.errorMessage,
          });
        }

        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} data-send-invoice-email-button>
          <Send className="mr-2 h-4 w-4" />
          {lastSentAt ? `Resend Invoice (Last: ${new Date(lastSentAt).toLocaleDateString()})` : 'Send Invoice'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Invoice #{invoiceNumber}</DialogTitle>
          <DialogDescription>
            Send this invoice to your customer via email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              To
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="customer@example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
              rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvoiceEmail;
