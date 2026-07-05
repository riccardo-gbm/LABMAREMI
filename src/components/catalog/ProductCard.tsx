import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getProductCode, getCategoryById } from "@/lib/catalog"
import { getCategoryIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

/**
 * Datasheet-entry card: icon tile + mono spec code up top, then name,
 * category, description and presentation. Two actions — open the full
 * spec sheet, or jump straight to a quote with the product preselected.
 */
function ProductCard({ product }: ProductCardProps) {
  const category = getCategoryById(product.categoryId)
  const Icon = getCategoryIcon(product.categoryId)

  return (
    <Card className="flex flex-col p-6 transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="font-mono text-xs tracking-widest text-muted-foreground">
          {getProductCode(product)}
        </span>
      </div>

      <h3 className="mt-5 font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
        <Link
          to={`/producto/${product.id}`}
          className="rounded-sm outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          {product.name}
        </Link>
      </h3>

      {category ? (
        <Badge variant="secondary" className="mt-2 w-fit">
          {category.name}
        </Badge>
      ) : null}

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      <p className="mt-4 border-t pt-3 font-mono text-xs text-muted-foreground">
        <span className="uppercase tracking-[0.14em]">Presentación</span>
        <span className="mx-2 text-border">·</span>
        <span className="text-foreground">{product.presentation}</span>
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 pt-1">
        <Link
          to={`/cotizacion?productos=${product.id}`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Solicitar cotización
        </Link>
        <Link
          to={`/producto/${product.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver detalle
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  )
}

export { ProductCard }
