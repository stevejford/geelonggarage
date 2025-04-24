import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Blue variants
        new: "bg-blue-100 text-blue-900 border border-blue-200",
        sent: "bg-blue-100 text-blue-900 border border-blue-200",
        contacted: "bg-blue-100 text-blue-900 border border-blue-200",
        inProgress: "bg-blue-100 text-blue-900 border border-blue-200",

        // Yellow variants
        pending: "bg-yellow-100 text-yellow-900 border border-yellow-200",

        // Green variants
        active: "bg-green-100 text-green-900 border border-green-200",
        completed: "bg-green-100 text-green-900 border border-green-200",
        paid: "bg-green-100 text-green-900 border border-green-200",
        accepted: "bg-green-100 text-green-900 border border-green-200",
        qualified: "bg-green-100 text-green-900 border border-green-200",

        // Red variants
        cancelled: "bg-red-100 text-red-900 border border-red-200",
        unpaid: "bg-red-100 text-red-900 border border-red-200",
        rejected: "bg-red-100 text-red-900 border border-red-200",
        unqualified: "bg-red-100 text-red-900 border border-red-200",

        // Purple variants
        scheduled: "bg-purple-100 text-purple-900 border border-purple-200",
        converted: "bg-purple-100 text-purple-900 border border-purple-200",

        // Orange variants
        overdue: "bg-orange-100 text-orange-900 border border-orange-200",

        // Gray variants
        inactive: "bg-gray-100 text-gray-900 border border-gray-200",
        draft: "bg-gray-100 text-gray-900 border border-gray-200",
      },
      size: {
        default: "text-xs",
        sm: "text-[10px] px-2 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "new",
      size: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status?: string;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, size, status, ...props }, ref) => {
    // If status is provided but variant isn't, try to map the status to a variant
    let resolvedVariant = variant;
    if (status && !variant) {
      const normalizedStatus = status.toLowerCase().replace(/\s+/g, '');

      // Map common status terms to variants
      const statusMap: Record<string, typeof variant> = {
        'new': 'new',
        'pending': 'pending',
        'active': 'active',
        'inactive': 'inactive',
        'completed': 'completed',
        'cancelled': 'cancelled',
        'canceled': 'cancelled',
        'scheduled': 'scheduled',
        'inprogress': 'inProgress',
        'in-progress': 'inProgress',
        'in progress': 'inProgress',
        'paid': 'paid',
        'unpaid': 'unpaid',
        'overdue': 'overdue',
        'draft': 'draft',
        'sent': 'sent',
        'accepted': 'accepted',
        'rejected': 'rejected',
        'qualified': 'qualified',
        'unqualified': 'unqualified',
        'contacted': 'contacted',
        'converted': 'converted',
      };

      resolvedVariant = statusMap[normalizedStatus] || variant;
    }

    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ variant: resolvedVariant, size, className }))}
        {...props}
      >
        {props.children || status}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };
