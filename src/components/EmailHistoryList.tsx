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
import { CheckCircle, XCircle } from 'lucide-react';

interface EmailHistoryListProps {
  documentType: string;
  documentId: string;
}

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
                {email.status === 'sent' ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> Sent
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-1" /> Failed
                    {email.errorMessage && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({email.errorMessage})
                      </span>
                    )}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmailHistoryList;
