import { Link } from "react-router-dom"
import {
  ArrowRight,
  ArrowUpRight,
  Handshake,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Section } from "@/components/ui/section"
import { getCategoryCode } from "@/lib/catalog"
import {
  coverageSectors,
  EMAIL_DISPLAY,
  PHONE_DISPLAY,
  WHATSAPP_HREF,
} from "@/lib/contact"
import { getBusinessTypeIcon, getCategoryIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { HeroSection } from "@/components/hero/HeroSection"
import { categories } from "@/data/categories"
import { businessTypes } from "@/data/businessTypes"

const reasons = [
  {
    icon: PackageCheck,
    title: "Catálogo integral",
    description:
      "Desde desinfectantes y desengrasantes hasta papel institucional, herramientas y equipos de protección. Un solo proveedor para todo el abastecimiento de su negocio.",
  },
  {
    icon: Truck,
    title: "Entrega confiable",
    description:
      "Distribuimos en todo Quito y provincias cercanas, con reposición constante para que su operación nunca se quede sin insumos.",
  },
  {
    icon: Handshake,
    title: "Atención B2B cercana",
    description:
      "Le acompañamos con asesoría por tipo de negocio y precios pensados para pedidos recurrentes y de volumen, no para consumo doméstico.",
  },
  {
    icon: ShieldCheck,
    title: "Calidad y bioseguridad",
    description:
      "Productos aptos para cocinas, baños, áreas de atención y entornos clínicos, con los estándares de higiene que su sector exige.",
  },
]

// Placeholder office location — generic Quito coordinates for the demo.
const OFFICE_MAP_SRC =
  "https://www.google.com/maps?q=-0.180653,-78.467834&z=13&output=embed"

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Why choose us */}
      <Section id="por-que-labmaremi" className="bg-background">
        <Eyebrow>Por qué LABMAREMI</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Un proveedor pensado para la operación de su negocio
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <Card key={reason.title} className="p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                <reason.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {reason.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Product category preview */}
      <Section id="categorias" className="border-y bg-secondary/40">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Catálogo / Categorías</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Todo lo que su negocio necesita para mantenerse limpio
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="group inline-flex items-center gap-1.5 font-mono text-sm font-medium text-primary hover:underline"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id)
            const code = getCategoryCode(category.id)
            return (
              <Link
                key={category.id}
                to={`/catalogo?categoria=${category.id}`}
                className="group relative flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">
                    {code}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Ver productos
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            )
          })}
        </div>
      </Section>

      {/* Business customer types */}
      <Section id="sectores" className="bg-background">
        <Eyebrow>Sectores que atendemos</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Diseñado para su tipo de negocio
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Entendemos las exigencias de cada sector y adaptamos el abastecimiento
          a su ritmo de trabajo.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {businessTypes.map((type) => {
            const Icon = getBusinessTypeIcon(type.id)
            return (
              <div
                key={type.id}
                className="flex items-center gap-3 rounded-xl border bg-card px-4 py-4 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-display text-sm font-semibold leading-tight text-foreground">
                  {type.name}
                </span>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Service area + map */}
      <Section id="cobertura" className="border-y bg-secondary/40">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Cobertura / Quito-EC</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Presencia en Quito y provincias cercanas
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Operamos desde Quito y abastecemos a empresas de la ciudad y sus
              alrededores. Coordinamos entregas periódicas para que su negocio
              mantenga su stock de limpieza e higiene sin interrupciones.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {coverageSectors.map((sector) => (
                <Badge key={sector} variant="outline" className="gap-1.5">
                  <MapPin className="h-3 w-3 text-ring" aria-hidden="true" />
                  {sector}
                </Badge>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border shadow-sm">
            <iframe
              title="Ubicación de LABMAREMI en Quito"
              src={OFFICE_MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[320px] w-full border-0 md:h-[400px]"
            />
          </div>
        </div>
      </Section>

      {/* Contact / WhatsApp CTA — closing conversion band */}
      <Section id="contacto-cta" className="bg-primary text-primary-foreground">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow className="text-primary-foreground/70">
              Solicite su cotización
            </Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              ¿Listo para abastecer su negocio con LABMAREMI?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/80">
              Cuéntenos qué productos necesita y le preparamos una cotización a
              su medida. También puede escribirnos directamente por WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/cotizacion"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" })
                )}
              >
                Solicitar cotización
                <ArrowRight />
              </Link>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <MessageCircle />
                Escribir por WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/5 p-6 backdrop-blur-sm">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary-foreground/60">
              Contacto directo
            </p>
            <ul className="mt-5 space-y-4">
              <li className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="font-mono text-sm">{PHONE_DISPLAY}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="font-mono text-sm">{EMAIL_DISPLAY}</span>
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
        </div>
      </Section>
    </>
  )
}
