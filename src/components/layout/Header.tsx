import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { AnimatePresence, m } from "framer-motion"
import { Menu, X } from "lucide-react"

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { routePrefetchers } from "@/lib/publicRoutes"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/contacto", label: "Contacto" },
]

/** Warm a route's lazy chunk on navigation intent (hover/focus/first touch) so
 * the page mounts the moment the route-transition exit finishes. */
const prefetchProps = (to: string) => ({
  onMouseEnter: () => routePrefetchers[to]?.(),
  onFocus: () => routePrefetchers[to]?.(),
  onTouchStart: () => routePrefetchers[to]?.(),
})

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const goToQuote = () => {
    setMobileOpen(false)
    navigate("/cotizacion")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/logo1.webp?v=2"
            alt="LABMAREMI"
            width={192}
            height={192}
            fetchPriority="high"
            decoding="async"
            // You can adjust 'scale-125' to make it bigger/smaller,
            // and '-translate-y-1' to move it up/down
            className="h-12 w-12 object-contain scale-80 -translate-y-[1px]"
          />
          <span className="font-quantico text-xl tracking-tight text-[#0066cc] ml-2">
            LABMAREMI
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              {...prefetchProps(item.to)}
              className={({ isActive }) =>
                cn(
                  "relative overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <m.span
                      layoutId="desktop-nav-active"
                      className="absolute inset-0 rounded-md bg-secondary"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <InteractiveHoverButton
            text="Solicitar cotización"
            onClick={goToQuote}
            {...prefetchProps("/cotizacion")}
          />
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen ? (
          <m.nav
            initial={{ gridTemplateRows: "0fr", opacity: 0 }}
            animate={{ gridTemplateRows: "1fr", opacity: 1 }}
            exit={{ gridTemplateRows: "0fr", opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="grid border-t bg-background md:hidden"
            aria-label="Principal móvil"
          >
            {/* Inner track collapses via the grid row (0fr↔1fr) — a transform-free
                reveal of unknown height that never animates the `height` property. */}
            <div className="min-h-0 overflow-hidden px-4 py-4">
              <ul className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <m.li
                    key={item.to}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      onClick={() => setMobileOpen(false)}
                      {...prefetchProps(item.to)}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-md px-3 py-2 text-sm font-medium",
                          isActive
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </m.li>
                ))}
              </ul>
              <InteractiveHoverButton
                text="Solicitar cotización"
                className="mt-3 w-full"
                onClick={goToQuote}
                {...prefetchProps("/cotizacion")}
              />
            </div>
          </m.nav>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

export { Header }
