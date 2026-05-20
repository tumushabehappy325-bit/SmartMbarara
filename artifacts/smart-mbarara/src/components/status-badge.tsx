import { Badge } from "./ui/badge";
import { ReportStatus } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        status === "Pending" && "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
        status === "In Progress" && "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
        status === "Resolved" && "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
        className
      )}
      data-testid={`status-${status.toLowerCase().replace(" ", "-")}`}
    >
      {status}
    </Badge>
  );
}
