import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import HeroFloatingCanvas from "@/components/hero/HeroFloatingCanvas"

const trustPoints = [
  { value: "5+", label: "años abasteciendo empresas" },
  { value: "200+", label: "productos" },
  { value: "Quito", label: "y provincias cercanas" },
]

function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden border-b md:min-h-[85vh]">
      {/* Full-bleed visual layer (floating product imagery) */}
      <div className="absolute inset-0" aria-hidden="true">
        <HeroFloatingCanvas />
      </div>

      {/* Centered glass panel — content carried over verbatim from M2 */}
      <div className="relative z-20 flex min-h-0 items-center justify-center px-4 py-16 md:min-h-[85vh]">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white/45 px-8 py-10 text-center shadow-xl backdrop-blur-md md:px-14 md:py-14">
          <span className="mb-3 inline-block font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Quito, Ecuador
          </span>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
            LABMAREMI
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            LABMAREMI distribuye productos de limpieza, desinfección, protección
            e higiene para restaurantes, oficinas, instituciones, hoteles y
            negocios que necesitan un abastecimiento confiable.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
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

          <dl className="mt-8 flex flex-wrap justify-center gap-8 border-t border-border pt-6">
            {trustPoints.map((point) => (
              <div key={point.label}>
                <dt className="text-2xl font-extrabold text-primary">
                  {point.value}
                </dt>
                <dd className="mt-1 max-w-[140px] text-xs leading-snug text-muted-foreground">
                  {point.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

export { HeroSection }
