import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button"
import { MediaFrame } from "@/components/ui/media-frame"
import { getCategoryIcon } from "@/lib/icons"
import type { CatalogProduct } from "@/lib/catalogData"

interface ProductCardProps {
  product: CatalogProduct
  priority?: boolean
}

/**
 * Datasheet-entry card: icon tile + mono spec code up top, then name,
 * category, description and presentation. Two actions — open the full
 * spec sheet, or jump straight to a quote with the product preselected.
 *
 * The whole card is the tap target for the spec sheet (it is the primary
 * action, and a card-sized target matters on a phone). That is done by
 * stretching the title link's `::after` over the card rather than wrapping
 * everything in an anchor: the quote CTA is itself a link, and nesting
 * anchors is invalid HTML that screen readers report inconsistently. The CTA
 * is lifted above the overlay so it stays independently clickable.
 */
function ProductCard({ product, priority = false }: ProductCardProps) {
  const Icon = getCategoryIcon(product.categoryId)

  return (
    <Card className="group relative flex w-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md has-[a:focus-visible]:border-ring/60 has-[a:focus-visible]:shadow-md">
      {/* No image yet → the category icon placeholder, not a stock photo of
          something that isn't this product. */}
      <MediaFrame
        src={product.imageUrl}
        alt={product.name}
        fallbackLabel="Imagen referencial del producto"
        fallbackIcon={Icon}
        priority={priority}
        className="aspect-[4/3] rounded-b-none border-0 border-b"
      />

      <div className="flex flex-1 flex-col p-5">
      {product.categoryName ? (
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary" className="w-fit">
            {product.categoryName}
          </Badge>
        </div>
      ) : null}

      <h3 className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
        {/* `after:` stretches this link's hit area over the whole card. It
            resolves against Card's `relative`, so this element must not be
            positioned itself. */}
        <Link
          to={`/producto/${product.slug}`}
          className="rounded-sm outline-none transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          {product.name}
        </Link>
      </h3>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      {/* Single full-width action. There is no "Ver detalle" link any more —
          the card itself opens the spec sheet, so a second anchor to the same
          slug would only be announced twice. `relative z-10` lifts this above
          the stretched overlay so the quote link still wins its own clicks. */}
      <div className="mt-auto pt-5">
        <InteractiveHoverLink
          to={`/cotizacion?productos=${product.slug}`}
          text="Solicitar cotización"
          className="relative z-10 w-full"
        />
      </div>
      </div>
    </Card>
  )
}

export { ProductCard }
