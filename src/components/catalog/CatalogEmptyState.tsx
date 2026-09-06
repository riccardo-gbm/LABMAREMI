import { m } from "framer-motion"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CatalogEmptyStateProps {
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function CatalogEmptyState({ hasActiveFilters, onClearFilters }: CatalogEmptyStateProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
        <SearchX className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-xl font-semibold tracking-tight text-foreground">
        Producto no encontrado
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Escríbanos y le cotizamos el producto que necesita.
      </p>
      {hasActiveFilters ? (
        <Button variant="outline" className="mt-6" onClick={onClearFilters}>
          Limpiar búsqueda y filtros
        </Button>
      ) : null}
    </m.div>
  )
}
