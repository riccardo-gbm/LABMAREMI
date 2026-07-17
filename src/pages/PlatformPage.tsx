import { Link } from "react-router-dom"
import { m } from "framer-motion"
import {
  ArrowUpRight,
  BadgeCheck,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  PackageSearch,
  PhoneCall,
  UserRound,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"

interface FlowStep {
  title: string
  description: string
  icon: LucideIcon
  href?: string
  preview: string
}

const flowSteps: FlowStep[] = [
  {
    title: "Visitante",
    description:
      "Un negocio de Quito llega al sitio buscando un proveedor confiable de insumos de limpieza.",
    icon: UserRound,
    preview: "Necesito abastecer mi local",
  },
  {
    title: "Catálogo",
    description:
      "Explora categorías, presentaciones y productos para su operación.",
    icon: PackageSearch,
    href: "/catalogo",
    preview: "DSF · DGR · PAP · EPP",
  },
  {
    title: "Cotización",
    description:
      "Envía sus datos, sector y productos de interés en el formulario.",
    icon: FileText,
    href: "/cotizacion",
    preview: "3 productos seleccionados",
  },
  {
    title: "Panel de leads",
    description:
      "La solicitud aparece como lead en el panel interno del equipo comercial.",
    icon: LayoutDashboard,
    href: "/admin",
    preview: "Nuevo · Contactado · Cliente",
  },
  {
    title: "Seguimiento",
    description:
      "El equipo confirma cantidades, frecuencia y condiciones de entrega.",
    icon: PhoneCall,
    preview: "WhatsApp + correo",
  },
  {
    title: "Cliente",
    description:
      "El negocio pasa a abastecimiento recurrente con atención continua.",
    icon: BadgeCheck,
    preview: "Reposición programada",
  },
]

export default function PlatformPage() {
  return (
    <>
      <PageHeader
        title="Flujo de la plataforma"
        description="Cómo la plataforma convierte a un visitante en un cliente recurrente, paso a paso."
      />

      <Section className="pt-8 md:pt-10">
        <Reveal className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:items-start">
          <div>
            <Eyebrow>Recorrido del cliente</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              De la primera visita al abastecimiento recurrente
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Esta vista explica la lógica comercial que después se conectará a
              Supabase: catálogo, solicitud, lead interno, seguimiento y cliente.
            </p>
          </div>

          <Card className="bg-secondary/40 p-5">
            <Eyebrow>Fase 1 · Demo</Eyebrow>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              En esta fase, el catálogo y el formulario funcionan con datos de
              ejemplo. En la Fase 2, las solicitudes se almacenarán en una base
              real y el panel será una herramienta operativa.
            </p>
          </Card>
        </Reveal>

        <div className="relative mt-12">
        <m.div
          aria-hidden="true"
          className="absolute left-8 right-8 top-[4.2rem] hidden h-px origin-left bg-gradient-to-r from-primary/10 via-ring/50 to-primary/10 xl:block"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />
        <RevealGroup className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-3" stagger={0.08}>
          {flowSteps.map((step, index) => (
            <RevealItem key={step.title} className="flex">
            <Card className="h-full w-full overflow-hidden transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md">
              <div className="flex items-center gap-4 border-b bg-secondary/40 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Paso {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-lg border bg-background p-4 shadow-sm">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ring">
                    Vista previa
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {step.preview}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {step.href ? (
                  <Link
                    to={step.href}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Ver página
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </Card>
            </RevealItem>
          ))}
        </RevealGroup>
        </div>
      </Section>
    </>
  )
}
