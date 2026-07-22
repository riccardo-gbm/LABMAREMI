import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, Inbox, Trophy, UserPlus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { DashboardSkeleton } from "@/components/admin/DashboardSkeleton"
import {
  deriveProductRanking,
  deriveStatusCounts,
  deriveTopCategories,
  fetchLeads,
  QUOTE_STATUSES,
  recentLeads as takeRecent,
  updateLeadStatus,
  type DashboardLead,
} from "@/lib/adminDashboard"
import type { QuoteStatus } from "@/types/database"
import { getCategoryCode } from "@/lib/catalog"

export default function AdminPage() {
  const [leads, setLeads] = useState<DashboardLead[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoadError(false)
    setLeads(null)
    try {
      setLeads(await fetchLeads())
    } catch {
      setLoadError(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = useCallback(
    async (id: string, next: QuoteStatus) => {
      setStatusError(null)
      let snapshot: DashboardLead[] | null = null
      setLeads((current) => {
        snapshot = current
        return current
          ? current.map((lead) =>
              lead.id === id ? { ...lead, status: next } : lead,
            )
          : current
      })
      setPendingId(id)
      try {
        await updateLeadStatus(id, next)
      } catch {
        // Revert the optimistic change and surface the failure.
        if (snapshot) setLeads(snapshot)
        setStatusError(
          "No se pudo actualizar el estado. Intente nuevamente.",
        )
      } finally {
        setPendingId(null)
      }
    },
    [],
  )

  const derived = useMemo(() => {
    if (!leads) return null
    const statusCounts = deriveStatusCounts(leads)
    const productRanking = deriveProductRanking(leads, 8)
    const topCategories = deriveTopCategories(leads, 5)
    return {
      totalRequests: leads.length,
      statusCounts,
      productRanking,
      topCategories,
      recent: takeRecent(leads, 8),
      maxProductCount: productRanking[0]?.count ?? 1,
    }
  }, [leads])

  if (loadError) {
    return (
      <>
        <PageHeader
          title="Panel de administración"
          description="Seguimiento de solicitudes de cotización y leads comerciales."
        />
        <Section className="pt-8 md:pt-10">
          <Card className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium text-foreground">
                No se pudieron cargar los datos.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verifique su conexión e intente nuevamente.
              </p>
            </div>
            <Button onClick={load}>Reintentar</Button>
          </Card>
        </Section>
      </>
    )
  }

  if (!derived) {
    return (
      <>
        <PageHeader
          title="Panel de administración"
          description="Seguimiento de solicitudes de cotización y leads comerciales."
        />
        <DashboardSkeleton />
      </>
    )
  }

  const {
    totalRequests,
    statusCounts,
    productRanking,
    topCategories,
    recent,
    maxProductCount,
  } = derived
  const pipelineTotal = Math.max(totalRequests, 1)
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
      value: String(statusCounts.nuevo),
      numericValue: statusCounts.nuevo,
      detail: "pendientes de contacto",
    },
    {
      icon: Users,
      label: "Clientes ganados",
      value: String(statusCounts.cliente),
      numericValue: statusCounts.cliente,
      detail: "compran con regularidad",
    },
    {
      icon: Trophy,
      label: "Categoría más solicitada",
      value: topCategory ? getCategoryCode(topCategory.slug ?? "") : "—",
      numericValue: undefined,
      detail: topCategory?.name ?? "sin datos",
    },
  ]

  return (
    <>
      <PageHeader
        title="Panel de administración"
        description="Seguimiento de solicitudes de cotización y leads comerciales."
      />

      <Section className="pt-8 md:pt-10">
        {/* Summary cards */}
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.detail}
                </p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>

        {totalRequests === 0 ? (
          <Reveal>
            <Card className="mt-4 flex flex-col items-center gap-3 p-12 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                <Inbox className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium text-foreground">
                  Aún no hay solicitudes registradas.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Las cotizaciones enviadas desde el sitio aparecerán aquí
                  automáticamente.
                </p>
              </div>
            </Card>
          </Reveal>
        ) : (
          <>
            {/* Status distribution */}
            <Card className="mt-4 p-5">
              <Eyebrow>Leads por estado</Eyebrow>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                {QUOTE_STATUSES.map((status) => (
                  <span key={status} className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="font-display text-sm font-semibold text-foreground">
                      {statusCounts[status]}
                    </span>
                  </span>
                ))}
              </div>
            </Card>

            {/* Pipeline */}
            <Card className="mt-4 p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Eyebrow>Pipeline comercial</Eyebrow>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Distribución de solicitudes por estado.
                  </p>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {totalRequests} solicitudes
                </p>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-5">
                {QUOTE_STATUSES.map((status) => {
                  const count = statusCounts[status]
                  const width = Math.max(
                    (count / pipelineTotal) * 100,
                    count > 0 ? 12 : 4,
                  )
                  return (
                    <div key={status} className="rounded-lg border bg-background p-3">
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={status} />
                        <span className="font-mono text-sm text-foreground">
                          {count}
                        </span>
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

            {statusError ? (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive"
              >
                {statusError}
              </p>
            ) : null}

            {/* Recent quote requests */}
            <RecentLeadsTable
              leads={recent}
              pendingId={pendingId}
              onStatusChange={handleStatusChange}
            />

            {/* Product interest + top categories */}
            <ProductInterestPanels
              productRanking={productRanking}
              topCategories={topCategories}
              maxProductCount={maxProductCount}
            />
          </>
        )}
      </Section>
    </>
  )
}
