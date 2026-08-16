import { useCallback } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ChevronRight, MessageCircle, PackageX } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button-variants"
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button"
import { MediaFrame } from "@/components/ui/media-frame"
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/ui/query-error"
import { ProductCard } from "@/components/catalog/ProductCard"
import { fetchProductBySlug } from "@/lib/catalogData"
import { getWhatsAppProductUrl } from "@/lib/contact"
import { useAsync } from "@/hooks/useAsync"
import { getCategoryIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { SeoHead } from "@/components/common/SeoHead"
import { JsonLd } from "@/components/common/JsonLd"
import { getProductSchema, getBreadcrumbSchema } from "@/lib/schemaData"

/**
 * "Uso recomendado" is free text with three shapes in the catalog: most
 * products store numbered steps separated by a blank line, a few store
 * unnumbered paragraphs, and the rest a single block. Rendering it raw runs the
 * steps together into one paragraph, so the shape is detected here instead.
 *
 * A lone newline inside a block is a hard wrap carried over from the source
 * PDF, never a deliberate break — those collapse back into spaces.
 */
function SpecValue({ value }: { value: string }) {
  const blocks = value
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)

  if (blocks.length < 2) return <>{blocks[0] ?? ""}</>

  // "1. …", "2. …" — let <ol> supply the numbering so the text hangs and wraps
  // against the marker instead of restarting at the left edge.
  const numbered = blocks.every((block, i) => block.startsWith(`${i + 1}. `))
  if (numbered) {
    return (
      <ol className="list-decimal space-y-2 pl-5 marker:text-muted-foreground">
        {blocks.map((block, i) => (
          <li key={block} className="pl-1">
            {block.slice(`${i + 1}. `.length)}
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div className="space-y-2">
      {blocks.map((block) => (
        <p key={block}>{block}</p>
      ))}
    </div>
  )
}

function PresentationPills({ value }: { value: string }) {
  if (!value) return null

  const items = value
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 py-0.5">
      {items.map((item) => (
        <Badge
          key={item}
          variant="outline"
          className="border-primary/35 bg-primary/5 text-primary font-mono text-xs font-medium tracking-wide rounded-full px-3 py-1 shadow-2xs"
        >
          {item}
        </Badge>
      ))}
    </div>
  )
}

/** Spec-sheet placeholder mirroring the two-column detail layout. */
function DetailSkeleton() {
  return (
    <Section className="pt-8 md:pt-10">
      <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-14">
        <Card className="aspect-square overflow-hidden">
          <Skeleton className="h-full w-full rounded-none" />
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const fetcher = useCallback(
    () => (slug ? fetchProductBySlug(slug) : Promise.resolve(null)),
    [slug],
  )
  const { data, loading, error, retry } = useAsync(fetcher)

  if (loading) return <DetailSkeleton />

  if (error) {
    return (
      <Section className="pt-8 md:pt-10">
        <QueryError
          onRetry={retry}
          title="No se pudo cargar el producto."
          description="Verifique su conexión e intente nuevamente."
        />
      </Section>
    )
  }

  // Distinct from the error state above: the fetch succeeded, the slug just
  // doesn't match any active product.
  if (!data) {
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

  const { product, related } = data
  const Icon = getCategoryIcon(product.categoryId)
  const code = product.code

  const productTitle = `${product.name} | Suministros de Limpieza en Quito | LABMAREMI`
  const productDesc = `${product.description} Presentación: ${product.presentation || "Consultar"}. Distribuidor B2B en Quito y Pichincha.`
  const canonicalUrl = `https://labmaremi.com/producto/${product.slug}`
  const imageUrl = product.imageUrl ? (product.imageUrl.startsWith("http") ? product.imageUrl : `https://labmaremi.com${product.imageUrl}`) : undefined

  const productSchema = getProductSchema({
    name: product.name,
    description: product.description,
    slug: product.slug,
    imageUrl: product.imageUrl,
    categoryName: product.categoryName,
    sku: product.code,
    presentation: product.presentation,
  })

  const breadcrumbs = [
    { name: "Inicio", url: "/" },
    { name: "Catálogo", url: "/catalogo" },
    { name: product.categoryName || "Categoría", url: `/catalogo?categoria=${product.categoryId}` },
    { name: product.name, url: `/producto/${product.slug}` },
  ]

  const specRows = [
    { label: "Código", value: code, mono: true },
    { label: "Categoría", value: product.categoryName || "-", mono: false },
    { label: "Presentación", value: product.presentation, mono: false, isPresentation: true },
    { label: "Uso recomendado", value: product.recommendedUse, mono: false, rich: true },
    { label: "Cobertura", value: "Atención corporativa y entregas en Quito, Pichincha y provincias aledañas.", mono: false },
  ]

  return (
    <>
      <SeoHead
        title={productTitle}
        description={productDesc}
        canonicalUrl={canonicalUrl}
        ogType="product"
        ogImage={imageUrl}
      />
      <JsonLd data={productSchema} id="product-jsonld-schema" />
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} id="product-breadcrumb-schema" />

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
                {product.categoryName || "Categoría"}
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
          <div>
            <MediaFrame
              src={product.imageUrl}
              alt={product.name}
              fallbackLabel="Imagen referencial del producto"
              fallbackIcon={Icon}
              badge={code}
              priority={true}
              className="aspect-square shadow-sm"
            />
          </div>

          {/* Spec sheet */}
          <div>
            {product.categoryName ? (
              <Badge variant="secondary" className="mt-5">
                {product.categoryName}
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
                  className="grid gap-1 px-5 py-4 sm:grid-cols-[160px_1fr] sm:gap-4 sm:items-center"
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
                    {row.isPresentation ? (
                      <PresentationPills value={row.value} />
                    ) : row.rich ? (
                      <SpecValue value={row.value} />
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
              <InteractiveHoverLink
                to={`/cotizacion?productos=${product.slug}`}
                text="Solicitar cotización"
                size="lg"
                className="w-full"
              />
              <a
                href={getWhatsAppProductUrl(product.name, product.code)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 hover:border-emerald-500/60 dark:text-emerald-400 dark:border-emerald-500/50 dark:hover:bg-emerald-500/20"
                )}
              >
                <MessageCircle className="h-4 w-4 fill-emerald-500/20 stroke-[2.25] text-emerald-600 dark:text-emerald-400" />
                Cotizar por WhatsApp
              </a>
              <Link
                to="/catalogo"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
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
          <Reveal>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">
              Productos relacionados
            </h2>
          </Reveal>
          <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedProduct) => (
              <RevealItem key={relatedProduct.id} className="flex">
                <ProductCard product={relatedProduct} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      ) : null}
    </>
  )
}
