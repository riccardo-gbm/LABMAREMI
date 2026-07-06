import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building,
  CheckCircle2,
  Factory,
  MapPin,
  Package,
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
  { value: "5+", label: "años de experiencia" },
  { value: "Quito", label: "y provincias" },
  { value: "B2B", label: "atención empresarial" },
]

interface StatItemProps {
  value: string
  label: string
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center justify-center px-3 text-center transition-transform hover:-translate-y-1">
      <span className="text-xl font-playfair font-bold text-primary sm:text-2xl">{value}</span>
      <span className="mt-1 text-[10px] font-medium uppercase leading-tight text-muted-foreground sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export default function GlassmorphismTrustHero() {
  return (
    <section className="relative w-full overflow-hidden border-b bg-background text-foreground">
      <div className="absolute inset-0 z-0 opacity-30" aria-hidden="true">
        <HeroFloatingCanvas />
      </div>

      <div className="relative z-20 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="relative flex flex-col justify-center space-y-7 p-6 md:p-8 lg:col-span-7">
          {/* Subtle borderless background glow for text readability */}
          <div className="absolute inset-0 z-[-1] rounded-[3rem] bg-white/40 blur-2xl pointer-events-none" />
          
          <div className="labmaremi-hero-fade-in labmaremi-hero-delay-100">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase text-primary shadow-sm backdrop-blur-md transition-colors hover:bg-white">
              <MapPin className="h-3.5 w-3.5 text-ring" aria-hidden="true" />
              Quito, Ecuador
            </div>
          </div>

          <h1 className="labmaremi-hero-fade-in labmaremi-hero-delay-200 text-5xl font-playfair font-bold leading-none text-black sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight">
            LABMAREMI
          </h1>

          <p className="labmaremi-hero-fade-in labmaremi-hero-delay-300 max-w-xl text-base leading-relaxed text-slate-900 font-medium md:text-lg">
            Distribuimos productos de limpieza, desinfección, protección e
            higiene para empresas que necesitan abastecimiento confiable en Quito
            y provincias cercanas.
          </p>

          <div className="labmaremi-hero-fade-in labmaremi-hero-delay-400 flex flex-col gap-3 sm:flex-row">
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

        <div className="space-y-5 lg:col-span-5">
          <div className="labmaremi-hero-fade-in labmaremi-hero-delay-500 relative overflow-hidden rounded-xl border border-white/70 bg-white/55 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
                  <Package className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-3xl font-playfair font-bold text-foreground">200+</div>
                  <div className="text-sm text-muted-foreground">
                    Productos disponibles
                  </div>
                </div>
              </div>

              <div className="mb-6 h-px w-full bg-primary/10" />

              <div className="grid grid-cols-3 divide-x divide-primary/10">
                {trustStats.map((stat) => (
                  <StatItem key={stat.label} {...stat} />
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-medium uppercase text-emerald-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Catálogo activo
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase text-primary">
                  <CheckCircle2
                    className="h-3 w-3 text-cyan-300"
                    aria-hidden="true"
                  />
                  Cotización directa
                </div>
              </div>
            </div>
          </div>

          <div className="labmaremi-hero-fade-in labmaremi-hero-delay-500 relative overflow-hidden rounded-xl border border-white/70 bg-white/55 py-7 shadow-xl backdrop-blur-xl">
            <h2 className="mb-6 px-6 text-sm font-medium text-muted-foreground md:px-8">
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
