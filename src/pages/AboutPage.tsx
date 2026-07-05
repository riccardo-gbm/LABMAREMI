import { Rocket, Store, Truck, Users, Warehouse } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Eyebrow } from "@/components/ui/eyebrow"
import { PageHeader } from "@/components/ui/page-header"
import { Section } from "@/components/ui/section"
import { Timeline, type TimelineEntry } from "@/components/about/Timeline"

const timelineEntries: TimelineEntry[] = [
  {
    year: "2021",
    title: "Fundación de LABMAREMI",
    description:
      "La familia Andrade funda LABMAREMI en Quito como un pequeño local de venta de insumos de limpieza para negocios del barrio.",
    icon: Store,
  },
  {
    year: "2022",
    title: "Primera bodega propia",
    description:
      "El crecimiento de pedidos nos lleva a abrir una bodega propia y ampliar el catálogo más allá de los productos básicos de limpieza.",
    icon: Warehouse,
  },
  {
    year: "2023",
    title: "Cobertura a provincias cercanas",
    description:
      "Empezamos a entregar fuera de Quito, llegando a negocios en el Valle de los Chillos, Cumbayá y Machachi con rutas periódicas.",
    icon: Truck,
  },
  {
    year: "2024",
    title: "Equipo de atención B2B",
    description:
      "Formamos un equipo dedicado a clientes institucionales — hoteles, clínicas y unidades educativas — con seguimiento personalizado.",
    icon: Users,
  },
  {
    year: "2026",
    title: "Lanzamiento de la plataforma digital",
    description:
      "Presentamos nuestro catálogo y proceso de cotización en línea, para que solicitar un pedido sea tan simple como visitar la bodega.",
    icon: Rocket,
  },
]

const owners = [
  {
    name: "Marco Andrade",
    role: "Fundador",
  },
  {
    name: "Daniela Andrade",
    role: "Gerente General",
  },
]

const teamMembers = [
  {
    name: "Patricio Salazar",
    role: "Coordinador de Logística",
  },
  {
    name: "Gabriela Torres",
    role: "Atención a Clientes B2B",
  },
  {
    name: "Wilson Chávez",
    role: "Jefe de Bodega",
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Nosotros"
        description="Una empresa familiar quiteña, construida entrega tras entrega durante los últimos cinco años."
      />

      {/* Intro / family framing */}
      <Section className="pt-8 md:pt-10">
        <div className="max-w-2xl">
          <Eyebrow>Quiénes somos</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Un negocio familiar que abastece a otros negocios
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            LABMAREMI nació en 2021 como el proyecto de una familia quiteña que
            vio la necesidad de un proveedor confiable de insumos de limpieza,
            desinfección e higiene para pequeños y medianos negocios. Cinco
            años después, seguimos siendo una empresa familiar — ahora con un
            equipo que comparte el mismo compromiso con el que empezamos: que
            ningún cliente se quede sin lo que necesita para operar limpio.
          </p>
        </div>
      </Section>

      {/* Timeline */}
      <Section className="border-y bg-secondary/40">
        <Eyebrow>Nuestra historia</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Cinco años de crecimiento, un paso a la vez
        </h2>
        <div className="mt-12 max-w-2xl">
          <Timeline entries={timelineEntries} />
        </div>
      </Section>

      {/* Team */}
      <Section>
        <Eyebrow>Nuestro equipo</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Las personas detrás de cada entrega
        </h2>

        <div className="mt-10">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Dirección
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {owners.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm"
              >
                <Avatar name={person.name} size="lg" />
                <div>
                  <p className="font-display text-lg font-semibold tracking-tight text-foreground">
                    {person.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Equipo operativo
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
              >
                <Avatar name={person.name} size="md" />
                <div>
                  <p className="font-display text-sm font-semibold tracking-tight text-foreground">
                    {person.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Fotos del equipo próximamente — por ahora, cada persona se identifica
          con sus iniciales.
        </p>
      </Section>
    </>
  )
}
