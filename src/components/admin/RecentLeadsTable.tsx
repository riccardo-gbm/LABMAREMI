import { m } from "framer-motion"

import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { businessTypes } from "@/data/businessTypes"
import type { getRecentLeads } from "@/lib/adminStats"
import { getBusinessTypeIcon } from "@/lib/icons"

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

function getBusinessTypeName(businessTypeId: string): string {
  return businessTypes.find((t) => t.id === businessTypeId)?.name ?? "—"
}

interface RecentLeadsTableProps {
  leads: ReturnType<typeof getRecentLeads>
}

/** Recent quote-request rows for the admin dashboard. */
function RecentLeadsTable({ leads }: RecentLeadsTableProps) {
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
              const TypeIcon = getBusinessTypeIcon(lead.businessTypeId)
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
                  className="border-b transition-colors last:border-b-0 hover:bg-secondary/30"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {lead.companyName}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <TypeIcon
                        className="h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {getBusinessTypeName(lead.businessTypeId)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {lead.location}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-foreground">
                    {lead.productsOfInterest.length}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={lead.status} />
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
