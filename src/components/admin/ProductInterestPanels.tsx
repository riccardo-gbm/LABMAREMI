import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { AnimatedProgress } from "@/components/ui/reveal"
import type {
  getProductInterestRanking,
  getTopCategories,
} from "@/lib/adminStats"
import { getCategoryCode } from "@/lib/catalog"
import { getCategoryIcon } from "@/lib/icons"

interface ProductInterestPanelsProps {
  productRanking: ReturnType<typeof getProductInterestRanking>
  topCategories: ReturnType<typeof getTopCategories>
  maxProductCount: number
}

/** Bottom analytics row: most-requested products + most-requested categories. */
function ProductInterestPanels({
  productRanking,
  topCategories,
  maxProductCount,
}: ProductInterestPanelsProps) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr]">
      <Card className="p-5">
        <Eyebrow>Productos más solicitados</Eyebrow>
        {productRanking.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            Sin datos todavía — el interés por producto se calculará a partir de
            las solicitudes recibidas.
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
          Conteo de menciones en los productos de interés de cada solicitud.
        </p>
      </Card>
    </div>
  )
}

export { ProductInterestPanels }
