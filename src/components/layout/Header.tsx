import { useEffect, useState } from "react"
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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const goToQuote = () => {
    setMobileOpen(false)
    navigate("/cotizacion")
  }

  // No backdrop-blur on this header. A sticky element with backdrop-filter
  // re-samples and re-blurs everything behind it on every scroll frame, and
  // Lenis ticks scroll on ~every rAF — so this one element was re-blurring
  // continuously on all seven pages. At 95% opacity the blur sat behind an
  // almost opaque background anyway, so dropping it costs nothing visually.
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95">
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 border-b bg-background shadow-lg md:hidden"
            aria-label="Principal móvil"
          >
            <div className="px-4 py-4">
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      onClick={() => setMobileOpen(false)}
                      {...prefetchProps(item.to)}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-secondary text-secondary-foreground font-semibold"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
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
