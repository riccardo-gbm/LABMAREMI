import { Link, useSearchParams } from "react-router-dom"
import { PackageCheck, X } from "lucide-react"

import { PageHeader } from "@/components/ui/page-header"
import { Section } from "@/components/ui/section"
import { getProductById } from "@/lib/catalog"

export const PRODUCTS_PARAM = "productos"

export default function QuotePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Products preselected from the catalog/detail pages, carried in the URL
  // (`?productos=id1,id2`). The full quote form (later milestone) will read
  // this same param to prefill "products of interest".
  const preselected = (searchParams.get(PRODUCTS_PARAM) ?? "")
    .split(",")
    .map((id) => getProductById(id.trim()))
    .filter((product) => product !== undefined)

  const removeProduct = (productId: string) => {
    setSearchParams(
      (params) => {
        const remaining = preselected
          .filter((product) => product.id !== productId)
          .map((product) => product.id)
        if (remaining.length > 0) {
          params.set(PRODUCTS_PARAM, remaining.join(","))
        } else {
          params.delete(PRODUCTS_PARAM)
        }
        return params
      },
      { replace: true }
    )
  }

  return (
    <>
      <PageHeader
        title="Solicitar cotización"
        description="Formulario de cotización en construcción (Fase 1)."
      />
      {preselected.length > 0 ? (
        <Section className="pt-8 md:pt-10">
          <div className="rounded-xl border bg-secondary/40 p-5">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <PackageCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Productos preseleccionados
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {preselected.map((product) => (
                <li
                  key={product.id}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background py-1 pl-3 pr-1.5 text-sm text-foreground"
                >
                  <Link
                    to={`/producto/${product.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {product.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    aria-label={`Quitar ${product.name}`}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Estos productos se incluirán en su solicitud cuando el formulario
              esté disponible.
            </p>
          </div>
        </Section>
      ) : null}
    </>
  )
}
