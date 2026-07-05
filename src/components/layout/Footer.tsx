import { Link } from "react-router-dom"
import { Droplets } from "lucide-react"

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

function Footer() {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-ring text-primary-foreground">
                <Droplets className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-base font-bold text-foreground">
                LABMAREMI
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Distribuidor de productos de limpieza, desinfección, protección e
              higiene para empresas en Quito y provincias cercanas.
            </p>
          </div>

          <nav aria-label="Enlaces del sitio">
            <h2 className="text-sm font-semibold text-foreground">Sitio</h2>
            <ul className="mt-3 space-y-2">
              {publicLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Vistas de demostración">
            <h2 className="text-sm font-semibold text-foreground">
              Vistas de demostración
            </h2>
            <ul className="mt-3 space-y-2">
              {demoLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LABMAREMI Cía. Ltda. — Quito, Ecuador.
            Demo de la Fase 1 con datos de ejemplo.
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
