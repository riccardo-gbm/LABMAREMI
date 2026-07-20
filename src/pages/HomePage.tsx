import { Link } from "react-router-dom"
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  ClipboardCheck,
  Handshake,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Route,
  Truck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  InteractiveHoverAnchor,
  InteractiveHoverLink,
} from "@/components/ui/interactive-hover-button"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { MediaFrame } from "@/components/ui/media-frame"
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"
import { getCategoryCode } from "@/lib/catalog"
import {
  coverageSectors,
  EMAIL_DISPLAY,
  OFFICE_MAP_SRC,
  PHONE_DISPLAY,
  WHATSAPP_HREF,
} from "@/lib/contact"
import { getBusinessTypeIcon, getCategoryIcon } from "@/lib/icons"
import { HeroSection } from "@/components/hero/HeroSection"
import { categories } from "@/data/categories"
import { businessTypes } from "@/data/businessTypes"

const reasons = [
    {
    icon: Truck,
    title: "Entregas inmediatas",
    description:
      "Coordinamos entregas el mismo día o hasta 48 horas a Quito y provincias cercanas.",
  },
  {
    icon: PackageCheck,
    title: "Continuidad de inventario",
    description:
      "Planificamos reposición para productos como papel, desinfectantes, guantes y químicos de uso diario.",
  },
  {
    icon: Boxes,
    title: "Catálogo completo",
    description:
      "Agrupamos limpieza, higiene, protección y consumibles para reducir compras dispersas entre varios proveedores",
  },
  {
    icon: Handshake,
    title: "Atención personalizada",
    description:
      "Acompañamos pedidos recurrentes con asesoría por tipo de negocio, presentación y frecuencia de consumo.",
  },
]

const procurementTiles = [
  {
    icon: Boxes,
    title: "Producto en inventario",
    label: "Disponibilidad",
    imageUrl:
      "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=900&auto=format&fit=crop",
    imageAlt: "Productos de limpieza organizados para abastecimiento",
  },
  {
    icon: Route,
    title: "Entrega inmediata",
    label: "Logística",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=900&auto=format&fit=crop",
    imageAlt: "Operación de limpieza y logística profesional",
  },
  {
    icon: ClipboardCheck,
    title: "Cotización personalizada",
    label: "Servicio",
    imageUrl:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=900&auto=format&fit=crop",
    imageAlt: "Guantes y protección para equipos operativos",
  },
]

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Image-led procurement band */}
      <Section id="abastecimiento" className="bg-background">
        <Reveal className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:items-end">
          <div className="flex h-full flex-col justify-center">
            <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground md:text-4xl">
              ¿Quienes somos?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              LABMAREMI es un distribuidor que centraliza todos los productos de limpieza, protección e higiene para tu negocio. Ofrecemos cotización directa personalizada, entregas inmediatas y
              seguimiento periódico.
            </p>
          </div>
          <RevealGroup className="grid gap-4 sm:grid-cols-3" stagger={0.07}>
            {procurementTiles.map((tile) => (
              <RevealItem key={tile.title} className="group">
                <MediaFrame
                  src={tile.imageUrl}
                  alt={tile.imageAlt}
                  fallbackLabel={tile.title}
                  fallbackIcon={tile.icon}
                  badge={tile.label}
                  className="aspect-[4/5] shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md"
                />
                <p className="mt-3 font-display text-base font-semibold tracking-tight text-foreground">
                  {tile.title}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>
      </Section>

      {/* Why choose us */}
      <Section id="por-que-labmaremi" className="border-y bg-secondary/40">
        <Reveal>
          <h2 className="mt-4 max-w-full font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Trabajar con nosotros le da estos beneficios a su negocio : 
          </h2>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <RevealItem key={reason.title}>
            <Card className="h-full overflow-hidden bg-white p-6 shadow-sm border border-slate-200 transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <reason.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {reason.description}
              </p>
            </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

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
            className="group inline-flex items-center gap-1.5 font-mono text-sm font-medium text-primary hover:underline"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id)
            return (
              <RevealItem key={category.id} className="flex">
              <Link
                to={`/catalogo?categoria=${category.id}`}
                className="group relative flex w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md"
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
      <Section id="sectores" className="bg-background">
        <Reveal>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Diseñado para su tipo de negocio
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Entendemos las exigencias de cada sector y adaptamos el abastecimiento
          a su ritmo de trabajo.
        </p>
        <RevealGroup
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          stagger={0.05}
        >
          {businessTypes.map((type) => {
            const Icon = getBusinessTypeIcon(type.id)
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
            <iframe
              title="Ubicación de LABMAREMI en Quito"
              src={OFFICE_MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
              className="h-[320px] w-full border-0 md:h-[400px]"
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
        </Reveal>
      </Section>
    </>
  )
}
