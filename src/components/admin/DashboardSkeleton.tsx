import { Card } from "@/components/ui/card"
import { Section } from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"

/** Loading placeholder that mirrors the admin dashboard layout. */
function DashboardSkeleton() {
  return (
    <Section className="pt-8 md:pt-10">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-full p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-9 w-16" />
            <Skeleton className="mt-2 h-3 w-28" />
          </Card>
        ))}
      </div>

      {/* Status distribution */}
      <Card className="mt-4 p-5">
        <Skeleton className="h-3 w-32" />
        <div className="mt-4 flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-24 rounded-full" />
          ))}
        </div>
      </Card>

      {/* Recent leads table */}
      <Card className="mt-4 p-5">
        <Skeleton className="h-3 w-40" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>

      {/* Analytics row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr]">
        <Card className="p-5">
          <Skeleton className="h-3 w-40" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <Skeleton className="h-3 w-40" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </Section>
  )
}

export { DashboardSkeleton }
