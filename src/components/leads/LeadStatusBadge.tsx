import {
  CircleDot,
  PhoneCall,
  CheckCircle2,
  XCircle,
  UserCheck
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

type LeadStatusBadgeProps = {
  status: string;
};

export default function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "New":
        return <CircleDot className="h-3 w-3 mr-1" />;
      case "Contacted":
        return <PhoneCall className="h-3 w-3 mr-1" />;
      case "Qualified":
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case "Unqualified":
        return <XCircle className="h-3 w-3 mr-1" />;
      case "Converted":
        return <UserCheck className="h-3 w-3 mr-1" />;
      default:
        return <CircleDot className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <StatusBadge status={status} className="inline-flex items-center">
      {getStatusIcon(status)}
      {status}
    </StatusBadge>
  );
}
