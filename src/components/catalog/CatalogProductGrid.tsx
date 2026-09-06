import { AnimatePresence, m } from "framer-motion"
import { ProductCard } from "@/components/catalog/ProductCard"
import type { CatalogProduct } from "@/lib/catalogData"

interface CatalogProductGridProps {
  products: CatalogProduct[]
}

/**
 * Three across only from xl. At lg the sidebar leaves ~185px per
 * card, under the ~195px the CTA needs before its nowrap label
 * starts clipping.
 */
export function CatalogProductGrid({ products }: CatalogProductGridProps) {
  return (
    <m.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {products.map((product, idx) => (
          <m.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex"
          >
            <ProductCard product={product} priority={idx < 6} />
          </m.div>
        ))}
      </AnimatePresence>
    </m.div>
  )
}
