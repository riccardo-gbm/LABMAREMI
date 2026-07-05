import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, ChevronRight, PackageX } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Section } from "@/components/ui/section"
import { ProductCard } from "@/components/catalog/ProductCard"
import {
  getCategoryById,
  getProductById,
  getProductCode,
  getRelatedProducts,
} from "@/lib/catalog"
import { getCategoryIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const product = id ? getProductById(id) : undefined

  if (!product) {
    return (
      <Section>
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
            <PackageX className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground">
            Producto no encontrado
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            El producto que busca no existe o fue retirado del catálogo. Revise
            el catálogo completo para encontrar una alternativa.
          </p>
          <Link
            to="/catalogo"
            className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
          >
            <ArrowLeft />
            Volver al catálogo
          </Link>
        </div>
      </Section>
    )
  }

  const category = getCategoryById(product.categoryId)
  const Icon = getCategoryIcon(product.categoryId)
  const code = getProductCode(product)
  const related = getRelatedProducts(product)

  const specRows = [
    { label: "Código", value: code, mono: true },
    { label: "Categoría", value: category?.name ?? "—", mono: false },
    { label: "Presentación", value: product.presentation, mono: false },
    { label: "Uso recomendado", value: product.recommendedUse, mono: false },
  ]

  return (
    <>
      <Section className="pb-0 pt-8 md:pb-0 md:pt-10">
        {/* Breadcrumb */}
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <li>
              <Link to="/catalogo" className="transition-colors hover:text-primary">
                Catálogo
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link
                to={`/catalogo?categoria=${product.categoryId}`}
                className="transition-colors hover:text-primary"
              >
                {category?.name ?? "Categoría"}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li aria-current="page" className="text-foreground">
              {code}
            </li>
          </ol>
        </nav>
      </Section>

      <Section className="pt-8 md:pt-10">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-14">
          {/* Specimen panel — image placeholder in Phase 1 */}
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-secondary via-background to-accent">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, oklch(0.929 0.013 255.508) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.929 0.013 255.508) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <span className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Icon className="h-11 w-11" aria-hidden="true" />
            </span>
            <span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Imagen referencial · próximamente
            </span>
            <span className="absolute right-4 top-4 font-mono text-xs tracking-widest text-muted-foreground">
              {code}
            </span>
          </div>

          {/* Spec sheet */}
          <div>
            <Eyebrow>Ficha de producto</Eyebrow>
            {category ? (
              <Badge variant="secondary" className="mt-5">
                {category.name}
              </Badge>
            ) : null}
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <dl className="mt-8 divide-y rounded-xl border">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 px-5 py-4 sm:grid-cols-[160px_1fr] sm:gap-4"
                >
                  <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground sm:pt-0.5">
                    {row.label}
                  </dt>
                  <dd
                    className={cn(
                      "text-sm leading-relaxed text-foreground",
                      row.mono && "font-mono tracking-widest"
                    )}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/cotizacion?productos=${product.id}`}
                className={cn(buttonVariants({ size: "lg" }), "group")}
              >
                Solicitar cotización de este producto
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/catalogo"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                <ArrowLeft />
                Volver al catálogo
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Related products */}
      {related.length > 0 ? (
        <Section className="border-t bg-secondary/40">
          <Eyebrow>Misma categoría</Eyebrow>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">
            Productos relacionados
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </Section>
      ) : null}
    </>
  )
}
