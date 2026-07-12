import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { TextReveal } from "@/components/ui/text-reveal"

const publicLinks = [
  { to: "/catalogo", label: "Catálogo de productos" },
  { to: "/cotizacion", label: "Solicitar cotización" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/contacto", label: "Contacto" },
]

const demoLinks = [
  { to: "/admin", label: "Panel de administración (demo)" },
  { to: "/platform", label: "Flujo de la plataforma (demo)" },
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
    <motion.li
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
    </motion.li>
  )
}

function Footer() {
  const reduceMotion = useReducedMotion()
  const year = new Date().getFullYear()
  const copyright = `© ${year} LABMAREMI Cía. Ltda. — Quito, Ecuador. Demo de la Fase 1 con datos de ejemplo.`

  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <motion.img
                src="/logo1.svg"
                alt="LABMAREMI"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="h-8 w-8 object-contain"
              />
              <TextReveal
                text="LABMAREMI"
                mode="letters"
                delay={0.08}
                stagger={0.025}
                className="text-base font-bold text-foreground"
              />
            </div>
            <TextReveal
              as="p"
              text="Distribuidor de productos de limpieza, desinfección, protección e higiene para empresas en Quito y provincias cercanas."
              delay={0.2}
              stagger={0.035}
              className="mt-3 max-w-xs text-sm text-muted-foreground"
            />
          </div>

          <nav aria-label="Enlaces del sitio">
            <TextReveal
              as="h2"
              mode="line"
              text="Sitio"
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

          <nav aria-label="Vistas de demostración">
            <TextReveal
              as="h2"
              mode="line"
              text="Vistas de demostración"
              delay={0.68}
              className="text-sm font-semibold text-foreground"
            />
            <ul className="mt-3 space-y-2">
              {demoLinks.map((link, index) => (
                <FooterLink
                  key={link.to}
                  {...link}
                  index={index}
                  baseDelay={0.76}
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
