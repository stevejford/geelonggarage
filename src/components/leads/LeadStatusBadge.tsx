import { cn } from "@/lib/utils";
import {
  CircleDot,
  PhoneCall,
  CheckCircle2,
  XCircle,
  UserCheck
} from "lucide-react";

type LeadStatusBadgeProps = {
  status: string;
};

export default function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "New":
        return {
          color: "bg-blue-100 text-blue-800 border border-blue-200",
          icon: <CircleDot className="h-3 w-3 mr-1" />
        };
      case "Contacted":
        return {
          color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          icon: <PhoneCall className="h-3 w-3 mr-1" />
        };
      case "Qualified":
        return {
          color: "bg-green-100 text-green-800 border border-green-200",
          icon: <CheckCircle2 className="h-3 w-3 mr-1" />
        };
      case "Unqualified":
        return {
          color: "bg-red-100 text-red-800 border border-red-200",
          icon: <XCircle className="h-3 w-3 mr-1" />
        };
      case "Converted":
        return {
          color: "bg-purple-100 text-purple-800 border border-purple-200",
          icon: <UserCheck className="h-3 w-3 mr-1" />
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border border-gray-200",
          icon: <CircleDot className="h-3 w-3 mr-1" />
        };
    }
  };

  const { color, icon } = getStatusInfo(status);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium shadow-sm",
        color
      )}
    >
      {icon}
      {status}
    </span>
  );
}
