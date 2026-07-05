import type { LeadStatus } from "@/types"
import { cn } from "@/lib/utils"

/**
 * Lead-status chip. Status color is functional information (state, not
 * branding), so each status gets a distinct hue outside the blue/cyan brand
 * palette where needed. The text label always accompanies the color — the
 * hue is never the only carrier of meaning.
 */
const statusStyles: Record<LeadStatus, { chip: string; dot: string }> = {
  Nuevo: {
    chip: "bg-cyan-100 text-cyan-900 border-cyan-200",
    dot: "bg-cyan-500",
  },
  Contactado: {
    chip: "bg-blue-100 text-blue-900 border-blue-200",
    dot: "bg-blue-500",
  },
  Interesado: {
    chip: "bg-amber-100 text-amber-900 border-amber-200",
    dot: "bg-amber-500",
  },
  Cliente: {
    chip: "bg-emerald-100 text-emerald-900 border-emerald-200",
    dot: "bg-emerald-500",
  },
  Rechazado: {
    chip: "bg-rose-100 text-rose-900 border-rose-200",
    dot: "bg-rose-500",
  },
}

interface StatusBadgeProps {
  status: LeadStatus
  className?: string
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = statusStyles[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles.chip,
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", styles.dot)}
      />
      {status}
    </span>
  )
}

export { StatusBadge }
