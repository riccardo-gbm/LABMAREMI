import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Eyebrow } from "@/components/ui/eyebrow"
import { cn } from "@/lib/utils"
import { HeroVisual } from "@/components/hero/HeroVisual"

const trustPoints = [
  { value: "5+", label: "años abasteciendo empresas" },
  { value: "9", label: "categorías de producto" },
  { value: "Quito", label: "y provincias cercanas" },
]

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-background">
      {/* Ambient wash — kept faint so hero copy stays the focus */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/50 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <Eyebrow>Distribuidor B2B · Quito, Ecuador</Eyebrow>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            Soluciones profesionales de limpieza e higiene para empresas en Quito
            y Ecuador.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            LABMAREMI distribuye productos de limpieza, desinfección, protección
            e higiene para restaurantes, oficinas, instituciones, hoteles y
            negocios que necesitan un abastecimiento confiable.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/cotizacion"
              className={cn(buttonVariants({ size: "lg" }), "group")}
            >
              Solicitar cotización
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/catalogo"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Ver catálogo
            </Link>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-8">
            {trustPoints.map((point) => (
              <div key={point.label}>
                <dt className="font-display text-2xl font-semibold text-primary">
                  {point.value}
                </dt>
                <dd className="mt-1 text-xs leading-snug text-muted-foreground">
                  {point.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:pl-4">
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}

export { HeroSection }
