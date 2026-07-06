import {
  Camera,
  Rocket,
  Store,
  Truck,
  UserRound,
  Users,
  Warehouse,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { MediaFrame } from "@/components/ui/media-frame"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"
import { Timeline, type TimelineEntry } from "@/components/about/Timeline"
import AboutHeroMorph from "@/components/about/AboutHeroMorph"

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
      "Formamos un equipo dedicado a clientes institucionales, hoteles, clínicas y unidades educativas, con seguimiento personalizado.",
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

interface TeamPerson {
  name: string
  role: string
  photoUrl?: string
  photoAlt?: string
}

const owners: TeamPerson[] = [
  {
    name: "Marco Andrade",
    role: "Fundador",
  },
  {
    name: "Daniela Andrade",
    role: "Gerente General",
  },
]

const teamMembers: TeamPerson[] = [
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

function TeamCard({ person }: { person: TeamPerson }) {
  return (
    <Card className="overflow-hidden">
      <MediaFrame
        src={person.photoUrl}
        alt={person.photoAlt ?? person.name}
        fallbackLabel="Foto temporal pendiente"
        fallbackIcon={UserRound}
        badge="Equipo"
        className="aspect-[4/3] rounded-b-none border-0 border-b"
      />
      <div className="p-5">
        <p className="font-display text-lg font-semibold tracking-tight text-foreground">
          {person.name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{person.role}</p>
      </div>
    </Card>
  )
}

export default function AboutPage() {
  return (
    <>
      <AboutHeroMorph />

      <PageHeader
        title="Nosotros"
        description="Una empresa familiar quiteña, construida entrega tras entrega durante los últimos cinco años."
      />

      <Section className="pt-8 md:pt-10">
        <Reveal className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div>
            <Eyebrow>Quiénes somos</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Un negocio familiar que abastece a otros negocios
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              LABMAREMI nació en 2021 como el proyecto de una familia quiteña que
              vio la necesidad de un proveedor confiable de insumos de limpieza,
              desinfección e higiene para pequeños y medianos negocios. Cinco
              años después, seguimos siendo una empresa familiar, ahora con un
              equipo que comparte el mismo compromiso con el que empezamos.
            </p>
          </div>
          <MediaFrame
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop"
            alt="Trabajo operativo de limpieza profesional"
            fallbackLabel="Espacio para foto familiar de LABMAREMI"
            fallbackIcon={Camera}
            badge="Foto referencial"
            className="aspect-[4/3] shadow-sm"
          />
        </Reveal>
      </Section>

      <Section className="border-y bg-secondary/40">
        <Reveal className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:items-start">
          <div>
            <Eyebrow>Nuestra historia</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Cinco años de crecimiento, un paso a la vez
            </h2>
            <MediaFrame
              src="https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=1000&auto=format&fit=crop"
              alt="Productos de limpieza organizados para abastecimiento"
              fallbackLabel="Espacio para foto de bodega y productos"
              fallbackIcon={Warehouse}
              badge="Bodega"
              className="mt-8 aspect-[4/3] shadow-sm"
            />
          </div>
          <div className="max-w-2xl">
            <Timeline entries={timelineEntries} />
          </div>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <Eyebrow>Nuestro equipo</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Las personas detrás de cada entrega
          </h2>
        </Reveal>

        <Reveal className="mt-10" delay={0.05}>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Dirección
          </p>
          <RevealGroup className="mt-4 grid gap-6 sm:grid-cols-2">
            {owners.map((person) => (
              <RevealItem key={person.name}>
                <TeamCard person={person} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>

        <Reveal className="mt-10" delay={0.08}>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Equipo operativo
          </p>
          <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((person) => (
              <RevealItem key={person.name}>
                <TeamCard person={person} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>

        <Reveal>
        <p className="mt-8 text-xs text-muted-foreground">
          Las imágenes de equipo son espacios temporales hasta cargar fotos
          reales de propietarios y colaboradores.
        </p>
        </Reveal>
      </Section>
    </>
  )
}
