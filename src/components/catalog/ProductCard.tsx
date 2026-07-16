import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button"
import { MediaFrame } from "@/components/ui/media-frame"
import { getProductCode, getCategoryById } from "@/lib/catalog"
import { getCategoryIcon } from "@/lib/icons"
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
  const productCode = getProductCode(product)

  return (
    <Card className="group flex w-full flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md">
      <MediaFrame
        src={product.imageUrl ?? category?.imageUrl}
        alt={product.imageAlt ?? category?.imageAlt ?? product.name}
        fallbackLabel="Imagen referencial del producto"
        fallbackIcon={Icon}
        badge={productCode}
        className="aspect-[4/3] rounded-b-none border-0 border-b"
      />

      <div className="flex flex-1 flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        {category ? (
          <Badge variant="secondary" className="w-fit">
            {category.name}
          </Badge>
        ) : (
          <span />
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ring">
          {product.presentation}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
        <Link
          to={`/producto/${product.id}`}
          className="rounded-sm outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          {product.name}
        </Link>
      </h3>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <InteractiveHoverLink
          to={`/cotizacion?productos=${product.id}`}
          text="Solicitar cotización"
          size="sm"
        />
        <Link
          to={`/producto/${product.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver detalle
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      </div>
    </Card>
  )
}

export { ProductCard }
