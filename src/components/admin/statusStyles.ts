import type { QuoteStatus } from "@/types/database"

/**
 * Lead-status chip colors, shared by StatusBadge and StatusSelect. Status color
 * is functional information (state, not branding), so each status gets a
 * distinct hue outside the blue/cyan brand palette where needed. The text label
 * always accompanies the color — the hue is never the only carrier of meaning.
 *
 * Lives in its own module (not next to a component) so the component files
 * export only components and Fast Refresh can preserve their state.
 */
export const statusStyles: Record<QuoteStatus, { chip: string; dot: string }> = {
  nuevo: {
    chip: "bg-cyan-100 text-cyan-900 border-cyan-200",
    dot: "bg-cyan-500",
  },
  contactado: {
    chip: "bg-blue-100 text-blue-900 border-blue-200",
    dot: "bg-blue-500",
  },
  interesado: {
    chip: "bg-amber-100 text-amber-900 border-amber-200",
    dot: "bg-amber-500",
  },
  cliente: {
    chip: "bg-emerald-100 text-emerald-900 border-emerald-200",
    dot: "bg-emerald-500",
  },
  rechazado: {
    chip: "bg-rose-100 text-rose-900 border-rose-200",
    dot: "bg-rose-500",
  },
}
