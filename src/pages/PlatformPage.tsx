import { Link } from "react-router-dom"
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
import { Section } from "@/components/ui/section"

interface FlowStep {
  title: string
  description: string
  icon: LucideIcon
  href?: string
}

const flowSteps: FlowStep[] = [
  {
    title: "Visitante",
    description:
      "Un negocio de Quito llega al sitio buscando un proveedor confiable de insumos de limpieza.",
    icon: UserRound,
  },
  {
    title: "Catálogo de productos",
    description:
      "Explora las categorías y encuentra los productos que su operación necesita.",
    icon: PackageSearch,
    href: "/catalogo",
  },
  {
    title: "Solicitud de cotización",
    description:
      "Envía sus datos, su tipo de negocio y sus productos de interés en el formulario.",
    icon: FileText,
    href: "/cotizacion",
  },
  {
    title: "Panel de leads",
    description:
      "La solicitud llega como lead al panel interno del equipo comercial.",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Seguimiento",
    description:
      "El equipo contacta al negocio, resuelve dudas y prepara la propuesta.",
    icon: PhoneCall,
  },
  {
    title: "Cliente",
    description:
      "El negocio se convierte en cliente, con abastecimiento recurrente y atención continua.",
    icon: BadgeCheck,
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
        <Eyebrow>Recorrido del cliente</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          De la primera visita al abastecimiento recurrente
        </h2>

        <div className="relative mt-12">
          {/* Connecting line across the icon row (desktop only) */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-6 hidden h-px bg-border lg:block"
          />
          <ol className="relative space-y-10 border-l border-border pl-8 lg:grid lg:grid-cols-6 lg:gap-5 lg:space-y-0 lg:border-l-0 lg:pl-0">
            {flowSteps.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[2.6rem] flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm lg:static lg:h-12 lg:w-12 lg:border-4">
                  <step.icon className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden="true" />
                </span>
                <p className="font-mono text-xs tracking-widest text-muted-foreground lg:mt-4">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 font-display text-base font-semibold leading-snug tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {step.href ? (
                  <Link
                    to={step.href}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Ver página
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        {/* Phase honesty note */}
        <Card className="mt-14 bg-secondary/40 p-6">
          <Eyebrow>Fase 1 · Demo</Eyebrow>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            En esta fase, el catálogo y el formulario de cotización funcionan
            con datos de ejemplo, y el panel de leads es una vista previa
            visual. En la Fase 2, las solicitudes se almacenarán en una base de
            datos real y el panel se convertirá en la herramienta de trabajo
            del equipo comercial.
          </p>
        </Card>
      </Section>
    </>
  )
}
