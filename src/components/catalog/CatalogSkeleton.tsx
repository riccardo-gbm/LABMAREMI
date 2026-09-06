import { Card } from "@/components/ui/card"
import { Section } from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"

/** Search bar, category column and card grid placeholders, matching the
 *  loaded layout so nothing jumps when the data lands. */
export function CatalogSkeleton() {
  return (
    <Section className="pt-8 md:pt-10">
      <Card className="p-4 md:p-5">
        <Skeleton className="h-11 w-full" />
      </Card>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start lg:gap-8">
        <div className="hidden lg:flex lg:flex-col lg:gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 w-full rounded-lg"
            />
          ))}
        </div>

        <div>
          <Skeleton className="mb-5 h-4 w-44" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="flex h-full w-full flex-col overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="mt-4 h-6 w-3/4" />
                  <Skeleton className="mt-3 h-14 w-full" />
                  <div className="mt-auto pt-5">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Skeleton className="h-9 w-72" />
          </div>
        </div>
      </div>
    </Section>
  )
}
