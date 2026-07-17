import { useReducedMotion } from "framer-motion"
import {
  Briefcase,
  Building,
  Factory,
  School,
  ShieldCheck,
  Utensils,
} from "lucide-react"

import HeroFloatingCanvas from "@/components/hero/HeroFloatingCanvas"
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button"
import { TextLoop } from "@/components/ui/text-loop"

const clientSegments = [
  { name: "Hoteles", icon: Building },
  { name: "Restaurantes", icon: Utensils },
  { name: "Oficinas", icon: Briefcase },
  { name: "Clínicas", icon: ShieldCheck },
  { name: "Instituciones Educativas", icon: School },
  { name: "Industrias", icon: Factory },
]

export default function GlassmorphismTrustHero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative w-full overflow-hidden border-b bg-background text-foreground">
      <div className="absolute inset-0 z-0 opacity-90" aria-hidden="true">
        <HeroFloatingCanvas />
      </div>

      <div className="relative z-20 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col gap-0 px-4 pt-32 pb-4 sm:px-6 md:pt-40 md:pb-8 lg:px-8">
        {/* Centered wordmark + CTAs */}
        <div className="flex flex-1 items-center justify-center pb-2 sm:pb-3 md:pb-4">
          <div className="relative flex flex-col items-center justify-center space-y-3 p-6 text-center md:p-8">
            {/* Subtle borderless background glow for text readability */}
            <div className="absolute inset-0 z-[-1] rounded-[3rem] bg-white/40 blur-2xl pointer-events-none" />

            {/* div, not p: TextLoop renders block-level divs, invalid inside <p> */}
            <div className="labmaremi-hero-fade-in labmaremi-hero-delay-100 flex flex-wrap items-baseline justify-center gap-x-1.5 text-base font-semibold text-foreground/80 sm:text-lg md:text-xl">
              Entregas
              <TextLoop
                className="w-[130px] text-left font-bold text-black sm:w-[150px] md:w-[170px]"
                interval={2.5}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                trigger={!reduceMotion}
              >
                <span>inmediatas</span>
                <span>el mismo día</span>
                <span>o en 48 horas</span>
                <span>en Quito</span>
              </TextLoop>
            </div>

            <div className="labmaremi-hero-fade-in labmaremi-hero-delay-200 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="text-5xl font-goodtimes font-bold leading-none text-[#0066cc] sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight">
                LABMAREMI
              </h1>
            </div>

            <div className="labmaremi-hero-fade-in labmaremi-hero-delay-400 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <InteractiveHoverLink
                to="/cotizacion"
                text="Solicitar cotización"
                size="lg"
                className="bg-blue-600 px-8 py-6 text-white shadow-md hover:bg-blue-700 transition-colors"
                dotClassName="left-3.5"
              />
              <InteractiveHoverLink
                to="/catalogo"
                text="Ver catálogo"
                variant="outline"
                size="lg"
                className="border border-primary/20 bg-white px-8 py-6 text-primary hover:bg-primary/5 transition-colors shadow-sm"
                dotClassName="left-3.5"
              />
            </div>
          </div>
        </div>

        {/* Bottom: sector marquee panel fills the full width */}
        <div className="labmaremi-hero-fade-in labmaremi-hero-delay-500 relative flex w-full flex-col justify-center overflow-hidden rounded-xl border border-slate-200 bg-white py-4 shadow-sm">
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
              {[0, 1, 2].flatMap((copy) =>
                clientSegments.map((client) => (
                  <div
                    key={`${client.name}-${copy}`}
                    className="flex cursor-default items-center gap-2 text-muted-foreground transition-all hover:scale-105 hover:text-foreground"
                  >
                    <client.icon
                      className="h-6 w-6 text-primary"
                      aria-hidden="true"
                    />
                    <span className="text-lg font-bold">{client.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
