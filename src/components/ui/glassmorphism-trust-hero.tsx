import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building,
  Factory,
  School,
  ShieldCheck,
  Utensils,
} from "lucide-react"

import HeroFloatingCanvas from "@/components/hero/HeroFloatingCanvas"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const clientSegments = [
  { name: "Hoteles", icon: Building },
  { name: "Restaurantes", icon: Utensils },
  { name: "Oficinas", icon: Briefcase },
  { name: "Clínicas", icon: ShieldCheck },
  { name: "Instituciones", icon: School },
  { name: "Industrias", icon: Factory },
]

const trustStats = [
  { value: "Entregas inmediatas", label: " en 24 horas" },
  { value: "Quito", label: "y provincias\ncercanas" },
]

interface StatItemProps {
  value: string
  label: string
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center justify-center px-3 text-center transition-transform hover:-translate-y-1">
      <span className="text-lg font-playfair font-bold text-primary sm:text-xl">{value}</span>
      <span className="mt-1 whitespace-pre-line text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export default function GlassmorphismTrustHero() {
  return (
    <section className="relative w-full overflow-hidden border-b bg-background text-foreground">
      <div className="absolute inset-0 z-0 opacity-90" aria-hidden="true">
        <HeroFloatingCanvas />
      </div>

      <div className="relative z-20 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col gap-0 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        {/* Centered wordmark + CTAs */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative flex flex-col items-center justify-center space-y-3 p-6 text-center md:p-8">
            {/* Subtle borderless background glow for text readability */}
            <div className="absolute inset-0 z-[-1] rounded-[3rem] bg-white/40 blur-2xl pointer-events-none" />

            <div className="labmaremi-hero-fade-in labmaremi-hero-delay-200 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="text-5xl font-goodtimes font-bold leading-none text-[#0066cc] sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight">
                LABMAREMI
              </h1>
            </div>

            <div className="labmaremi-hero-fade-in labmaremi-hero-delay-400 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/cotizacion"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group rounded-full bg-blue-600 px-8 py-6 text-white shadow-[0_0_24px_rgba(37,99,235,0.32)] hover:bg-blue-500"
                )}
              >
                Solicitar cotización
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/catalogo"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-primary/15 bg-white/70 px-8 py-6 text-primary backdrop-blur-sm hover:bg-white hover:text-primary"
                )}
              >
                <BookOpen className="opacity-80" aria-hidden="true" />
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom row: stats rectangle (left) + sector marquee rectangle (right) */}
        <div className="labmaremi-hero-fade-in labmaremi-hero-delay-500 flex w-full flex-col gap-5 lg:flex-row">
          {/* Left: trust stats */}
          <div className="relative overflow-hidden rounded-xl border border-white/70 bg-white/55 px-4 py-4 shadow-lg backdrop-blur-xl lg:w-[360px]">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 flex h-full items-center justify-center">
              <div className="grid w-full grid-cols-2 divide-x divide-primary/10">
                {trustStats.map((stat) => (
                  <StatItem key={stat.label} {...stat} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: sector marquee fills the remaining width */}
          <div className="relative flex flex-1 flex-col justify-center overflow-hidden rounded-xl border border-white/70 bg-white/55 py-4 shadow-lg backdrop-blur-xl">
            <h2 className="mb-2 px-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:px-8">
              Atendemos sectores como:
            </h2>

            <div
              className="relative flex overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
              }}
            >
              <div className="labmaremi-hero-marquee flex gap-10 whitespace-nowrap px-4">
                {[...clientSegments, ...clientSegments, ...clientSegments].map(
                  (client, index) => (
                    <div
                      key={`${client.name}-${index}`}
                      className="flex cursor-default items-center gap-2 text-muted-foreground transition-all hover:scale-105 hover:text-foreground"
                    >
                      <client.icon
                        className="h-6 w-6 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-lg font-bold">{client.name}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
