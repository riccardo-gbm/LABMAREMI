import { useCallback, useMemo, useState } from "react"
import { CalendarDays, MessageCircle, MousePointerClick, PackageSearch } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { QueryError } from "@/components/ui/query-error"
import { AnimatedMetric, AnimatedProgress } from "@/components/ui/reveal"
import { Skeleton } from "@/components/ui/skeleton"
import { useAsync } from "@/hooks/useAsync"
import {
  CLICK_SOURCE_LABEL,
  deriveClickCategoryRanking,
  deriveClickProductRanking,
  deriveClicksBySource,
  deriveClickTimeBuckets,
  fetchWhatsAppClicks,
  WEEKDAY_LABELS,
  type ClickRankEntry,
  type WhatsAppClick,
} from "@/lib/adminDashboard"
import { cn } from "@/lib/utils"

const RANGES = [7, 30, 90] as const
type RangeDays = (typeof RANGES)[number]

function clickWord(n: number) {
  return n === 1 ? "clic" : "clics"
}

/**
 * WhatsApp click analytics (migration 0008). Loads independently of the leads
 * dashboard above it, so a failure here never takes the quotes view down.
 */
function WhatsAppMetricsSection() {
  const [days, setDays] = useState<RangeDays>(30)

  const fetcher = useCallback(() => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return fetchWhatsAppClicks(since.toISOString())
  }, [days])
  const { data: clicks, loading, error, retry } = useAsync(fetcher)

  return (
    <section aria-labelledby="whatsapp-metrics-title" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>WhatsApp</Eyebrow>
          <h2
            id="whatsapp-metrics-title"
            className="mt-2 font-playfair text-2xl font-bold tracking-tight text-foreground"
          >
            Consultas por WhatsApp
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Clics en los botones de WhatsApp del sitio. Un clic indica intención
            de contacto; no confirma que el mensaje se haya enviado.
          </p>
        </div>
        <div role="group" aria-label="Rango de fechas" className="flex gap-1.5">
          {RANGES.map((range) => (
            <Button
              key={range}
              size="sm"
              variant={range === days ? "default" : "outline"}
              aria-pressed={range === days}
              onClick={() => setDays(range)}
            >
              {range} días
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <QueryError
          className="mt-5"
          onRetry={retry}
          title="No se pudieron cargar los clics de WhatsApp."
        />
      ) : !clicks ? (
        <MetricsSkeleton />
      ) : (
        <div className={cn("transition-opacity", loading && "opacity-60")}>
          <MetricsBody clicks={clicks} days={days} />
        </div>
      )}
    </section>
  )
}

function MetricsBody({ clicks, days }: { clicks: WhatsAppClick[]; days: RangeDays }) {
  const derived = useMemo(() => {
    const bySource = deriveClicksBySource(clicks)
    return {
      total: clicks.length,
      bySource,
      products: deriveClickProductRanking(clicks, 10),
      categories: deriveClickCategoryRanking(clicks, 8),
      time: deriveClickTimeBuckets(clicks),
    }
  }, [clicks])

  if (derived.total === 0) {
    return (
      <Card className="mt-5 flex flex-col items-center gap-3 p-12 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-medium text-foreground">
            Aún no hay clics registrados en este período.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Los datos se acumulan desde la activación del seguimiento.
          </p>
        </div>
      </Card>
    )
  }

  const { total, bySource, products, categories, time } = derived
  const weeklyAverage = (total / days) * 7
  const productShare = Math.round((bySource.product / total) * 100)

  const statCards = [
    {
      icon: MousePointerClick,
      label: "Clics en WhatsApp",
      value: total,
      detail: `últimos ${days} días`,
    },
    {
      icon: PackageSearch,
      label: "Desde fichas de producto",
      value: bySource.product,
      detail: `${productShare}% del total`,
    },
    {
      icon: CalendarDays,
      label: "Promedio semanal",
      value: Math.round(weeklyAverage * 10) / 10,
      detail: "clics por semana",
    },
  ]

  return (
    <>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="h-full p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="mt-3 font-playfair text-4xl font-bold tracking-tight text-foreground">
              {Number.isInteger(stat.value) ? (
                <AnimatedMetric value={stat.value} />
              ) : (
                stat.value.toLocaleString("es-EC")
              )}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr]">
        <RankCard
          title="Productos más consultados"
          empty="Ningún clic provino todavía de una ficha de producto."
          entries={products}
        />
        <RankCard
          title="Categorías"
          empty="Sin datos de categoría todavía."
          entries={categories}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_3fr]">
        <Card className="p-5">
          <Eyebrow>Día de la semana</Eyebrow>
          <ColumnChart
            columns={time.byWeekday.map((value, i) => ({
              id: WEEKDAY_LABELS[i],
              label: WEEKDAY_LABELS[i],
              value,
              description: `${WEEKDAY_LABELS[i]}: ${value} ${clickWord(value)}`,
            }))}
          />
        </Card>
        <Card className="p-5">
          <Eyebrow>Hora del día (Quito)</Eyebrow>
          <ColumnChart
            columns={time.byHour.map((value, h) => {
              const hh = String(h).padStart(2, "0")
              return {
                id: `h${hh}`,
                label: h % 3 === 0 ? String(h) : "",
                value,
                description: `${hh}:00–${hh}:59: ${value} ${clickWord(value)}`,
              }
            })}
          />
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <Eyebrow>Origen del clic</Eyebrow>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(CLICK_SOURCE_LABEL) as (keyof typeof CLICK_SOURCE_LABEL)[]).map(
            (source) => {
              const count = bySource[source]
              return (
                <li key={source} className="rounded-lg border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground">
                      {CLICK_SOURCE_LABEL[source]}
                    </span>
                    <span className="font-mono text-sm text-foreground">{count}</span>
                  </div>
                  <AnimatedProgress
                    value={(count / total) * 100}
                    className="mt-3 h-2 rounded-full bg-secondary"
                    barClassName="h-2 rounded-full bg-primary"
                    ariaLabel={`${CLICK_SOURCE_LABEL[source]}: ${count} ${clickWord(count)}`}
                  />
                </li>
              )
            },
          )}
        </ul>
      </Card>
    </>
  )
}

function RankCard({
  title,
  empty,
  entries,
}: {
  title: string
  empty: string
  entries: ClickRankEntry[]
}) {
  const max = entries[0]?.count ?? 1
  return (
    <Card className="p-5">
      <Eyebrow>{title}</Eyebrow>
      {entries.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {entries.map((entry) => (
            <li key={entry.key}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium text-foreground">{entry.name}</p>
                <p className="font-mono text-sm text-foreground">{entry.count}</p>
              </div>
              <AnimatedProgress
                value={(entry.count / max) * 100}
                className="mt-1.5 h-2 w-full rounded-full bg-secondary"
                barClassName="h-2 rounded-full bg-primary"
                ariaLabel={`${entry.name}: ${entry.count} ${clickWord(entry.count)}`}
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/**
 * Single-series column chart in plain CSS. Each column is a full-height hit
 * target with a native tooltip, so hovering the empty space above a short bar
 * still reveals its value.
 */
interface Column {
  id: string
  label: string
  value: number
  description: string
}

function ColumnChart({ columns }: { columns: Column[] }) {
  const max = Math.max(...columns.map((c) => c.value), 1)
  const peakId = columns.reduce((best, c) => (c.value > best.value ? c : best), columns[0]).id
  return (
    <div className="mt-5">
      <ol className="flex h-36 items-end gap-0.5 border-b border-border" aria-label="Distribución de clics">
        {columns.map((column) => (
          <li
            key={column.id}
            title={column.description}
            aria-label={column.description}
            className="group relative flex h-full flex-1 items-end"
          >
            {column.id === peakId && column.value > 0 ? (
              <span
                className="absolute inset-x-0 text-center font-mono text-[10px] text-muted-foreground"
                style={{ bottom: `calc(${(column.value / max) * 100}% + 2px)` }}
              >
                {column.value}
              </span>
            ) : null}
            <span
              className="w-full rounded-t-[4px] bg-primary transition-colors group-hover:bg-primary/80"
              style={{ height: column.value > 0 ? `${(column.value / max) * 100}%` : 0 }}
            />
          </li>
        ))}
      </ol>
      <div className="mt-1.5 flex gap-0.5" aria-hidden="true">
        {columns.map((column) => (
          <span key={column.id} className="flex-1 text-center font-mono text-[10px] text-muted-foreground">
            {column.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="h-full p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-9 w-16" />
            <Skeleton className="mt-2 h-3 w-28" />
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr]">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-5 h-40 w-full" />
          </Card>
        ))}
      </div>
    </>
  )
}

export { WhatsAppMetricsSection }
