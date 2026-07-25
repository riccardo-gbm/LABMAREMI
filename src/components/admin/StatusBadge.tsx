import type { QuoteStatus } from "@/types/database"
import { STATUS_LABEL } from "@/lib/adminDashboard"
import { statusStyles } from "@/components/admin/statusStyles"
import { cn } from "@/lib/utils"

/** Lead-status chip: colored pill + label. Colors live in statusStyles.ts. */
interface StatusBadgeProps {
  status: QuoteStatus
  className?: string
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = statusStyles[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles.chip,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", styles.dot)}
      />
      {STATUS_LABEL[status]}
    </span>
  )
}

export { StatusBadge }
