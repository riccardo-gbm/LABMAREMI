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

const clientSegments = [
  { name: "Hoteles", icon: Building },
  { name: "Restaurantes", icon: Utensils },
  { name: "Oficinas", icon: Briefcase },
  { name: "Clínicas", icon: ShieldCheck },
  { name: "Instituciones Educativas", icon: School },
  { name: "Industrias", icon: Factory },
]

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
              <InteractiveHoverLink
                to="/cotizacion"
                text="Solicitar cotización"
                size="lg"
                className="liquid-glass bg-blue-600 px-8 py-6 text-white shadow-[0_0_24px_rgba(37,99,235,0.32)] inset-shadow-[0_1px_0_rgba(255,255,255,0.35),0_-1px_0_rgba(0,0,0,0.12)]"
                dotClassName="left-3.5"
              />
              <InteractiveHoverLink
                to="/catalogo"
                text="Ver catálogo"
                variant="outline"
                size="lg"
                className="liquid-glass border-primary/15 bg-white/70 px-8 py-6 text-primary backdrop-blur-md backdrop-saturate-150 inset-shadow-[0_1px_0_rgba(255,255,255,0.8),0_-1px_0_rgba(15,23,42,0.06)]"
                dotClassName="left-3.5"
              />
            </div>
          </div>
        </div>

        {/* Bottom: sector marquee panel fills the full width */}
        <div className="labmaremi-hero-fade-in labmaremi-hero-delay-500 liquid-glass relative flex w-full flex-col justify-center overflow-hidden rounded-xl border border-white/40 bg-white/55 py-4 shadow-lg backdrop-blur-xl backdrop-saturate-150 inset-shadow-[0_1px_0_rgba(255,255,255,0.8),0_-1px_0_rgba(15,23,42,0.08)]">
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
    </section>
  )
}
