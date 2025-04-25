import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  XCircle,
  Mail,
  MailCheck,
  Eye,
  MousePointer,
  AlertTriangle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmailHistoryListProps {
  documentType: string;
  documentId: string;
}

// Helper function to get the appropriate status icon
const getStatusIcon = (email: any) => {
  switch (email.status) {
    case 'sent':
      return (
        <span className="flex items-center text-blue-600">
          <Mail className="h-4 w-4 mr-1" /> Sent
        </span>
      );
    case 'delivered':
      return (
        <span className="flex items-center text-green-600">
          <MailCheck className="h-4 w-4 mr-1" /> Delivered
        </span>
      );
    case 'opened':
      return (
        <span className="flex items-center text-green-600">
          <Eye className="h-4 w-4 mr-1" /> Opened
        </span>
      );
    case 'clicked':
      return (
        <span className="flex items-center text-green-600">
          <MousePointer className="h-4 w-4 mr-1" /> Clicked
        </span>
      );
    case 'bounced':
      return (
        <span className="flex items-center text-red-600">
          <AlertTriangle className="h-4 w-4 mr-1" /> Bounced
        </span>
      );
    case 'complained':
      return (
        <span className="flex items-center text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" /> Complained
        </span>
      );
    case 'delayed':
      return (
        <span className="flex items-center text-yellow-600">
          <Clock className="h-4 w-4 mr-1" /> Delayed
        </span>
      );
    case 'failed':
      return (
        <span className="flex items-center text-red-600">
          <XCircle className="h-4 w-4 mr-1" /> Failed
        </span>
      );
    default:
      return (
        <span className="flex items-center text-gray-600">
          <CheckCircle className="h-4 w-4 mr-1" /> {email.status}
        </span>
      );
  }
};

// Helper function to get the tooltip text
const getStatusTooltip = (email: any) => {
  switch (email.status) {
    case 'sent':
      return `Email was sent on ${formatDate(email.sentAt)}`;
    case 'delivered':
      return `Email was delivered on ${formatDate(email.deliveredAt)}`;
    case 'opened':
      return `Email was opened on ${formatDate(email.openedAt)}`;
    case 'clicked':
      return `Email link was clicked on ${formatDate(email.clickedAt)}`;
    case 'bounced':
      return `Email bounced on ${formatDate(email.bouncedAt)}${email.errorMessage ? `: ${email.errorMessage}` : ''}`;
    case 'complained':
      return `Recipient marked as spam on ${formatDate(email.complainedAt)}`;
    case 'delayed':
      return `Email delivery was delayed on ${formatDate(email.delayedAt)}`;
    case 'failed':
      return `Email failed to send: ${email.errorMessage || 'Unknown error'}`;
    default:
      return `Email status: ${email.status}`;
  }
};

const EmailHistoryList: React.FC<EmailHistoryListProps> = ({
  documentType,
  documentId,
}) => {
  const emailHistory = useQuery(api.emailHistory.getEmailHistory, {
    documentType,
    documentId,
  });

  if (!emailHistory || emailHistory.length === 0) {
    return <p className="text-sm text-gray-500 italic">No email history available.</p>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Email History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emailHistory.map((email) => (
            <TableRow key={email._id}>
              <TableCell>{formatDate(email.sentAt)}</TableCell>
              <TableCell>{email.recipientEmail}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {getStatusIcon(email)}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getStatusTooltip(email)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmailHistoryList;
