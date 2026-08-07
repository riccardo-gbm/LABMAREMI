import { Link } from "react-router-dom"
import { m, useReducedMotion } from "framer-motion"
import { TextReveal } from "@/components/ui/text-reveal"

const publicLinks = [
  { to: "/catalogo", label: "Catálogo de productos" },
  { to: "/cotizacion", label: "Solicitar cotización" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/contacto", label: "Contacto" },
]

interface FooterLinkProps {
  to: string
  label: string
  index: number
  baseDelay: number
}

function FooterLink({ to, label, index, baseDelay }: FooterLinkProps) {
  const reduceMotion = useReducedMotion()
  const content = (
    <Link
      to={to}
      className="text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      {label}
    </Link>
  )

  if (reduceMotion) {
    return <li>{content}</li>
  }

  return (
    <m.li
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.7 }}
      transition={{
        duration: 0.34,
        ease: "easeOut",
        delay: baseDelay + index * 0.07,
      }}
    >
      {content}
    </m.li>
  )
}

function Footer() {
  const reduceMotion = useReducedMotion()
  const year = new Date().getFullYear()
  const copyright = `© ${year} LABMAREMI ECUADOR Cía. Ltda. Todos los derechos reservados.`

  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <m.img
                src="/logo1.webp"
                alt="LABMAREMI"
                width={192}
                height={192}
                loading="lazy"
                decoding="async"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="h-20 w-20 object-contain"
              />
              <TextReveal
                text="LABMAREMI ECUADOR CIA. LTDA."
                delay={0.08}
                stagger={0.025}
                className="text-base font-bold text-foreground"
              />
            </div>
            <TextReveal
              as="p"
              text="Distribuidor de productos de limpieza, desinfección, protección e higiene para empresas en Pichincha y provincias cercanas."
              delay={0.2}
              stagger={0.035}
              className="mt-3 max-w-xs text-sm text-muted-foreground"
            />
          </div>

          <nav aria-label="Enlaces del sitio" className="md:text-right">
            <TextReveal
              as="h2"
              mode="line"
              text="Navegación"
              delay={0.42}
              className="text-sm font-semibold text-foreground"
            />
            <ul className="mt-3 space-y-2">
              {publicLinks.map((link, index) => (
                <FooterLink
                  key={link.to}
                  {...link}
                  index={index}
                  baseDelay={0.5}
                />
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t pt-6">
          <TextReveal
            as="p"
            mode="line"
            text={copyright}
            delay={0.95}
            className="text-xs text-muted-foreground"
          />
        </div>
      </div>
    </footer>
  )
}

export { Footer }
