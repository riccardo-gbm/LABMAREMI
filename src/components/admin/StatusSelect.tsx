import { ChevronDown } from "lucide-react"

import { statusStyles } from "@/components/admin/StatusBadge"
import { QUOTE_STATUSES, STATUS_LABEL } from "@/lib/adminDashboard"
import type { QuoteStatus } from "@/types/database"
import { cn } from "@/lib/utils"

interface StatusSelectProps {
  value: QuoteStatus
  onChange: (next: QuoteStatus) => void
  disabled?: boolean
}

/**
 * Editable status chip — a native <select> styled to look like the colored
 * StatusBadge so the table keeps its visual language while becoming editable.
 */
function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  const styles = statusStyles[value]
  return (
    <span
      className={cn(
        "relative inline-flex items-center rounded-full border pl-2.5 pr-6 text-xs font-medium",
        styles.chip,
        disabled && "opacity-60",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", styles.dot)}
      />
      <select
        aria-label="Cambiar estado del lead"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as QuoteStatus)}
        className="cursor-pointer appearance-none bg-transparent py-0.5 pr-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
      >
        {QUOTE_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABEL[status]}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2"
      />
    </span>
  )
}

export { StatusSelect }
