import { m } from "framer-motion"

import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { StatusSelect } from "@/components/admin/StatusSelect"
import type { DashboardLead } from "@/lib/adminDashboard"
import type { QuoteStatus } from "@/types/database"
import { getBusinessTypeIconByName } from "@/lib/icons"

/** ISO timestamp (e.g. "2026-07-21T14:03:00Z") → "dd/mm/yyyy". */
function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}/${d.getFullYear()}`
}

interface RecentLeadsTableProps {
  leads: DashboardLead[]
  pendingId: string | null
  onStatusChange: (id: string, next: QuoteStatus) => void
}

/** Recent quote-request rows for the admin dashboard. */
function RecentLeadsTable({
  leads,
  pendingId,
  onStatusChange,
}: RecentLeadsTableProps) {
  return (
    <Card className="mt-4 overflow-hidden">
      <div className="border-b px-5 py-4">
        <Eyebrow>Solicitudes recientes</Eyebrow>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b bg-secondary/40">
              <th className="px-5 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Empresa
              </th>
              <th className="px-5 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Tipo de negocio
              </th>
              <th className="px-5 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Sector
              </th>
              <th className="px-5 py-3 text-right font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Productos
              </th>
              <th className="px-5 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Fecha
              </th>
              <th className="px-5 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
                  Aún no hay solicitudes registradas. Las nuevas cotizaciones
                  aparecerán aquí.
                </td>
              </tr>
            ) : null}
            {leads.map((lead, index) => {
              const TypeIcon = getBusinessTypeIconByName(lead.businessTypeName)
              const productNames = lead.products.map((p) => p.name)
              return (
                <m.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.24,
                    ease: "easeOut",
                    delay: index * 0.035,
                  }}
                  className="border-b align-top transition-colors last:border-b-0 hover:bg-secondary/30"
                >
                  <td className="px-5 py-3.5">
                    <span className="block font-medium text-foreground">
                      {lead.companyName}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {lead.contactPerson}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <TypeIcon
                        className="h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {lead.businessTypeName ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {lead.location || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className="font-mono text-foreground"
                      title={productNames.join(", ") || undefined}
                    >
                      {lead.products.length}
                    </span>
                    {productNames.length > 0 ? (
                      <span className="mt-0.5 block max-w-[220px] truncate text-right text-xs text-muted-foreground">
                        {productNames.join(", ")}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusSelect
                      value={lead.status}
                      disabled={pendingId === lead.id}
                      onChange={(next) => onStatusChange(lead.id, next)}
                    />
                  </td>
                </m.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export { RecentLeadsTable }
