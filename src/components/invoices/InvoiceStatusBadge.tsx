import {
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

type InvoiceStatusBadgeProps = {
  status: string;
};

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Draft":
        return <FileText className="h-3 w-3 mr-1" />;
      case "Sent":
        return <Send className="h-3 w-3 mr-1" />;
      case "Paid":
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case "Overdue":
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case "Cancelled":
        return <XCircle className="h-3 w-3 mr-1" />;
      case "Pending":
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return <FileText className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <StatusBadge status={status} className="inline-flex items-center">
      {getStatusIcon(status)}
      {status}
    </StatusBadge>
  );
}
