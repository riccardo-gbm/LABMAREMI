import { FlaskConical, Inbox, Trophy, UserPlus, Users } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { PageHeader } from "@/components/ui/page-header"
import {
  AnimatedMetric,
  AnimatedProgress,
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { RecentLeadsTable } from "@/components/admin/RecentLeadsTable"
import { ProductInterestPanels } from "@/components/admin/ProductInterestPanels"
import {
  getProductInterestRanking,
  getRecentLeads,
  getStatusCounts,
  getTopCategories,
  getTotalRequests,
  LEAD_STATUSES,
} from "@/lib/adminStats"
import { getCategoryCode } from "@/lib/catalog"

export default function AdminPage() {
  const totalRequests = getTotalRequests()
  const statusCounts = getStatusCounts()
  const pipelineTotal = Math.max(totalRequests, 1)
  const topCategories = getTopCategories(5)
  const productRanking = getProductInterestRanking(8)
  const recentLeads = getRecentLeads(8)

  const maxProductCount = productRanking[0]?.count ?? 1
  const topCategory = topCategories[0]

  const statCards = [
    {
      icon: Inbox,
      label: "Solicitudes totales",
      value: String(totalRequests),
      numericValue: totalRequests,
      detail: "cotizaciones recibidas",
    },
    {
      icon: UserPlus,
      label: "Leads nuevos",
      value: String(statusCounts.Nuevo),
      numericValue: statusCounts.Nuevo,
      detail: "pendientes de contacto",
    },
    {
      icon: Users,
      label: "Clientes ganados",
      value: String(statusCounts.Cliente),
      numericValue: statusCounts.Cliente,
      detail: "compran con regularidad",
    },
    {
      icon: Trophy,
      label: "Categoría más solicitada",
      value: topCategory ? getCategoryCode(topCategory.category.id) : "—",
      numericValue: undefined,
      detail: topCategory?.category.name ?? "sin datos",
    },
  ]

  return (
    <>
      <PageHeader
        title="Panel de administración"
        description="Vista interna del seguimiento de solicitudes de cotización y leads comerciales."
      />

      <Section className="pt-8 md:pt-10">
        {/* Preview notice — this is a demo, not a live system */}
        <Reveal>
        <div
          role="note"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
        >
          <FlaskConical
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-amber-900">
            <span className="font-mono text-xs font-medium uppercase tracking-[0.14em]">
              Vista previa · datos simulados
            </span>
            <br />
            Este panel es una demostración de la Fase 1 con información de
            ejemplo. No es un sistema en producción ni contiene datos de
            clientes reales.
          </p>
        </div>
        </Reveal>

        {/* Summary cards */}
        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <RevealItem key={stat.label}>
            <Card className="h-full p-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </p>
                <stat.icon
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-3 font-playfair text-4xl font-bold tracking-tight text-foreground">
                {typeof stat.numericValue === "number" ? (
                  <AnimatedMetric value={stat.numericValue} />
                ) : (
                  stat.value
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
            </Card>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Status distribution */}
        <Card className="mt-4 p-5">
          <Eyebrow>Leads por estado</Eyebrow>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
            {LEAD_STATUSES.map((status) => (
              <span key={status} className="flex items-center gap-2">
                <StatusBadge status={status} />
                <span className="font-display text-sm font-semibold text-foreground">
                  {statusCounts[status]}
                </span>
              </span>
            ))}
          </div>
        </Card>

        <Card className="mt-4 p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Pipeline comercial</Eyebrow>
              <p className="mt-2 text-sm text-muted-foreground">
                Distribución visual de solicitudes simuladas por estado.
              </p>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {totalRequests} solicitudes
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {LEAD_STATUSES.map((status) => {
              const count = statusCounts[status]
              const width = Math.max((count / pipelineTotal) * 100, count > 0 ? 12 : 4)
              return (
                <div key={status} className="rounded-lg border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={status} />
                    <span className="font-mono text-sm text-foreground">{count}</span>
                  </div>
                  <AnimatedProgress
                    value={width}
                    className="mt-3 h-2 rounded-full bg-secondary"
                    barClassName="h-2 rounded-full bg-primary"
                    ariaLabel={`${status}: ${count} ${count === 1 ? "solicitud" : "solicitudes"}`}
                  />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Recent quote requests */}
        <RecentLeadsTable leads={recentLeads} />

        {/* Product interest + top categories */}
        <ProductInterestPanels
          productRanking={productRanking}
          topCategories={topCategories}
          maxProductCount={maxProductCount}
        />
      </Section>
    </>
  )
}
