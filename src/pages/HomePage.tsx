import { Link } from "react-router-dom"
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  InteractiveHoverAnchor,
  InteractiveHoverLink,
} from "@/components/ui/interactive-hover-button"
import { Card } from "@/components/ui/card"
import { MediaFrame } from "@/components/ui/media-frame"
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"
import { LazyMapFrame } from "@/components/ui/lazy-map-frame"
import {
  coverageSectors,
  EMAIL_DISPLAY,
  OFFICE_MAP_SRC,
  PHONE_DISPLAY,
  WHATSAPP_HREF,
} from "@/lib/contact"
import { trackWhatsAppClick } from "@/lib/whatsappTracking"
import { getBusinessTypeIconByName, getCategoryIcon } from "@/lib/icons"
import { HeroSection } from "@/components/hero/HeroSection"
import { AboutBenefitsSection } from "@/components/home/AboutBenefitsSection"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/ui/query-error"
import { fetchBusinessTypes, fetchCategories } from "@/lib/catalogData"
import { useAsync } from "@/hooks/useAsync"
import { SeoHead } from "@/components/common/SeoHead"
import { JsonLd } from "@/components/common/JsonLd"
import { getLocalBusinessSchema } from "@/lib/schemaData"

function fetchHomeData() {
  // Categories only — the full catalog fetch pulled ~138 product rows onto the
  // landing route's critical path just to discard them.
  return Promise.all([fetchCategories(), fetchBusinessTypes()]).then(
    ([categories, businessTypes]) => ({
      categories,
      businessTypes,
    }),
  )
}

export default function HomePage() {
  // The hero and every static band render immediately; only the two
  // data-driven grids below wait on this.
  const { data, loading, error, retry } = useAsync(fetchHomeData)

  return (
    <>
      <SeoHead
        title="LABMAREMI ECUADOR | Distribuidor de Limpieza, Desinfección e Higiene en Quito"
        description="Distribuidor B2B de productos de limpieza, desinfección, protección e higiene industrial para empresas en Quito y Pichincha. Entregas inmediatas y cotización directa."
        canonicalUrl="https://labmaremi.com/"
      />
      <JsonLd data={getLocalBusinessSchema()} id="home-localbusiness-schema" />
      <HeroSection />

      <AboutBenefitsSection />

      {/* Product category preview */}
      <Section id="categorias" className="bg-background">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>

            <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Todo lo que su negocio necesita para mantenerse limpio
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="group inline-flex items-center gap-1.5 tabular-nums text-sm font-medium text-primary hover:underline"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        {loading ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {error ? <QueryError className="mt-12" onRetry={retry} /> : null}

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.categories ?? []).map((category) => {
            const Icon = getCategoryIcon(category.id)
            return (
              <RevealItem key={category.id} className="flex">
              <Link
                to={`/catalogo?categoria=${category.id}`}
                className="group relative flex w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md"
              >
                <MediaFrame
                  src={category.imageUrl}
                  alt={category.imageAlt ?? category.name}
                  fallbackLabel={category.name}
                  fallbackIcon={Icon}
                  className="aspect-[16/10] rounded-b-none border-0 border-b"
                />
                <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Ver productos
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
                </div>
              </Link>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </Section>

      {/* Business customer types */}
      <Section id="sectores" className="border-t bg-background">
        <Reveal>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Diseñado para su tipo de negocio
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Entendemos las exigencias de cada sector y adaptamos el abastecimiento
          a su ritmo de trabajo.
        </p>
        {loading ? (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[74px] w-full rounded-xl" />
            ))}
          </div>
        ) : null}

        <RevealGroup
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          stagger={0.05}
        >
          {(data?.businessTypes ?? []).map((type) => {
            // DB business_types has no slug column, so the icon map is
            // keyed by display name.
            const Icon = getBusinessTypeIconByName(type.name)
            return (
              <RevealItem
                key={type.id}
                className="flex items-center gap-3 rounded-xl border bg-card px-4 py-4 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-display text-sm font-semibold leading-tight text-foreground">
                  {type.name}
                </span>
              </RevealItem>
            )
          })}
        </RevealGroup>
        </Reveal>
      </Section>

      {/* Service area + map */}
      <Section id="cobertura" className="border-y bg-secondary/40">
        <Reveal className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Presencia en Quito y provincias cercanas
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Operamos desde Quito y abastecemos a empresas de la ciudad y sus
              alrededores. Coordinamos entregas periódicas para que su negocio
              mantenga su stock de limpieza e higiene sin interrupciones.
            </p>
            <RevealGroup className="mt-8 flex flex-wrap gap-2" stagger={0.04}>
              {coverageSectors.map((sector) => (
                <RevealItem key={sector} distance={10}>
                  <Badge variant="outline" className="gap-1.5">
                    <MapPin className="h-3 w-3 text-ring" aria-hidden="true" />
                    {sector}
                  </Badge>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <Reveal className="overflow-hidden rounded-xl border shadow-sm" direction="left">
            <LazyMapFrame
              title="Ubicación de LABMAREMI en Quito"
              src={OFFICE_MAP_SRC}
              heightClassName="h-[320px] md:h-[400px]"
            />
          </Reveal>
        </Reveal>
      </Section>

      {/* Contact / WhatsApp CTA — closing conversion band */}
      <Section id="contacto-cta" className="bg-primary text-primary-foreground">
        <Reveal className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              ¿Listo para abastecer su negocio con LABMAREMI?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/80">
              Cuéntenos qué productos necesita y le preparamos una cotización a
              su medida. También puede escribirnos directamente por WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <InteractiveHoverLink
                to="/cotizacion"
                text="Solicitar cotización"
                variant="secondary"
                size="lg"
              />
              <InteractiveHoverAnchor
                href={WHATSAPP_HREF}
                onClick={() => trackWhatsAppClick("home")}
                target="_blank"
                rel="noreferrer"
                text="Escribir por WhatsApp"
                variant="inverse"
                size="lg"
                icon={<MessageCircle aria-hidden="true" />}
              />
            </div>
          </div>

          <div className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/5 p-6 backdrop-blur-sm">
            <p className="tabular-nums text-xs uppercase tracking-[0.16em] text-primary-foreground/60">
              Contacto directo
            </p>
            <ul className="mt-5 space-y-4">
              <li className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="tabular-nums text-sm">{PHONE_DISPLAY}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="tabular-nums text-sm">{EMAIL_DISPLAY}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm text-primary-foreground/80">
                  Quito, Ecuador
                </span>
              </li>
            </ul>
            <Link
              to="/contacto"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-foreground hover:underline"
            >
              Ver todas las formas de contacto
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
