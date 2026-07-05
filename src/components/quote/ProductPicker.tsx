import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { categories } from "@/data/categories"
import { products } from "@/data/products"
import { getCategoryCode, getProductById, matchesQuery } from "@/lib/catalog"
import { getCategoryIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

interface ProductPickerProps {
  value: string[]
  onChange: (next: string[]) => void
  /** id used to associate an external error message via aria-describedby */
  errorId?: string
}

/**
 * Products-of-interest control: a searchable chip picker grouped by category,
 * matching the catalog's filter-chip language. Selected items also surface as
 * a removable summary row so the choice stays visible while scrolling.
 */
function ProductPicker({ value, onChange, errorId }: ProductPickerProps) {
  const [query, setQuery] = useState("")

  const selectedProducts = useMemo(
    () => value.map((id) => getProductById(id)).filter((p) => p !== undefined),
    [value]
  )

  const groupedFiltered = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          items: products.filter(
            (product) =>
              product.categoryId === category.id && matchesQuery(product, query)
          ),
        }))
        .filter((group) => group.items.length > 0),
    [query]
  )

  const toggle = (productId: string) => {
    if (value.includes(productId)) {
      onChange(value.filter((id) => id !== productId))
    } else {
      onChange([...value, productId])
    }
  }

  return (
    <div>
      {selectedProducts.length > 0 ? (
        <ul className="mb-3 flex flex-wrap gap-2">
          {selectedProducts.map((product) => (
            <li
              key={product.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-secondary py-1 pl-3 pr-1.5 text-sm text-secondary-foreground"
            >
              {product.name}
              <button
                type="button"
                onClick={() => toggle(product.id)}
                aria-label={`Quitar ${product.name}`}
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar producto por nombre…"
          aria-label="Buscar producto para agregar"
          className="pl-9"
        />
      </div>

      <div
        role="group"
        aria-describedby={errorId}
        className="mt-3 max-h-64 space-y-4 overflow-y-auto rounded-md border p-4"
      >
        {groupedFiltered.length > 0 ? (
          groupedFiltered.map(({ category, items }) => {
            const Icon = getCategoryIcon(category.id)
            return (
              <div key={category.id}>
                <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {category.name}
                  <span className="text-muted-foreground/60">
                    {getCategoryCode(category.id)}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {items.map((product) => {
                    const isSelected = value.includes(product.id)
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggle(product.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background text-muted-foreground hover:border-ring/60 hover:text-foreground"
                        )}
                      >
                        {product.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Ningún producto coincide con "{query}".
          </p>
        )}
      </div>
    </div>
  )
}

export { ProductPicker }
