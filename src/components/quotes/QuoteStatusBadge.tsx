import {
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

type QuoteStatusBadgeProps = {
  status: string;
};

export default function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Draft":
        return <FileText className="h-3 w-3 mr-1" />;
      case "Sent":
        return <Send className="h-3 w-3 mr-1" />;
      case "Accepted":
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case "Rejected":
        return <XCircle className="h-3 w-3 mr-1" />;
      case "Expired":
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
