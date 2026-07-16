import { Link } from "react-router-dom"
import { Phone } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Reveal } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"

export default function NotFoundPage() {
  return (
    <Section className="flex min-h-[60vh] items-center">
      <Reveal className="mx-auto max-w-xl text-center">
        <Eyebrow className="justify-center">Error / 404</Eyebrow>
        <p
          aria-hidden="true"
          className="mt-6 font-mono text-7xl font-medium tracking-tight text-primary/20 md:text-8xl"
        >
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Página no encontrada
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          La página que busca no existe o fue movida. Puede volver al inicio o
          continuar hacia nuestro catálogo de productos.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <InteractiveHoverLink to="/" text="Volver al inicio" size="lg" />
          <InteractiveHoverLink
            to="/catalogo"
            text="Ver catálogo"
            variant="outline"
            size="lg"
          />
          <Link
            to="/contacto"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            <Phone aria-hidden="true" />
            Contacto
          </Link>
        </div>
      </Reveal>
    </Section>
  )
}
