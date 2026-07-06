import { FlaskConical, Inbox, Trophy, UserPlus, Users } from "lucide-react"
import { motion } from "framer-motion"

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
import { businessTypes } from "@/data/businessTypes"
import {
  getProductInterestRanking,
  getRecentLeads,
  getStatusCounts,
  getTopCategories,
  getTotalRequests,
  LEAD_STATUSES,
} from "@/lib/adminStats"
import { getCategoryCode } from "@/lib/catalog"
import { getBusinessTypeIcon, getCategoryIcon } from "@/lib/icons"

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

function getBusinessTypeName(businessTypeId: string): string {
  return businessTypes.find((t) => t.id === businessTypeId)?.name ?? "—"
}

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
                {recentLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-muted-foreground"
                    >
                      Aún no hay solicitudes registradas. Las nuevas
                      cotizaciones aparecerán aquí.
                    </td>
                  </tr>
                ) : null}
                {recentLeads.map((lead, index) => {
                  const TypeIcon = getBusinessTypeIcon(lead.businessTypeId)
                  return (
                    <motion.tr
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
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Product interest + top categories */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr]">
          <Card className="p-5">
            <Eyebrow>Productos más solicitados</Eyebrow>
            {productRanking.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">
                Sin datos todavía — el interés por producto se calculará a
                partir de las solicitudes recibidas.
              </p>
            ) : null}
            <ul className="mt-5 space-y-4">
              {productRanking.map(({ product, count }) => (
                <li key={product.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.name}
                      <span className="ml-2 font-mono text-xs tracking-widest text-muted-foreground">
                        {getCategoryCode(product.categoryId)}
                      </span>
                    </p>
                    <p className="font-mono text-sm text-foreground">{count}</p>
                  </div>
                  <AnimatedProgress
                    value={(count / maxProductCount) * 100}
                    className="mt-1.5 h-2 w-full rounded-full bg-secondary"
                    barClassName="h-2 rounded-full bg-primary"
                    ariaLabel={`${product.name}: ${count} ${count === 1 ? "solicitud" : "solicitudes"}`}
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <Eyebrow>Categorías más solicitadas</Eyebrow>
            {topCategories.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">
                Sin datos todavía — las categorías se ordenarán según las
                solicitudes recibidas.
              </p>
            ) : null}
            <ul className="mt-5 space-y-3">
              {topCategories.map(({ category, count }, index) => {
                const Icon = getCategoryIcon(category.id)
                return (
                  <li
                    key={category.id}
                    className="flex items-center gap-3 rounded-lg border px-3.5 py-3"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {category.name}
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {count}
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Conteo de menciones en los productos de interés de cada
              solicitud.
            </p>
          </Card>
        </div>
      </Section>
    </>
  )
}
