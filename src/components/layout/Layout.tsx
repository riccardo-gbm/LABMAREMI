import { Suspense, useEffect, useRef } from "react"
import { Outlet } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { AnimatePresence, LazyMotion, m, MotionConfig, domMax } from "framer-motion"

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import WhatsAppWidget from "@/components/layout/WhatsAppWidget"

function Layout() {
  const location = useLocation()

  // The landing route must paint visible: starting <main> at opacity 0 gates
  // the LCP candidate on framer-motion's first animation frame. Only the very
  // first route gets a visible initial; navigations keep the fade. The ref
  // flips after mount, and each subsequent m.main remounts (key=pathname), so
  // it re-reads the ref on every navigation.
  const isFirstRoute = useRef(true)
  useEffect(() => {
    isFirstRoute.current = false
  }, [])

  return (
    // domMax (not domAnimation) because Header and CatalogPage use layoutId/layout
    // shared-element animations, which need the layout-projection feature set.
    <LazyMotion features={domMax}>
      <MotionConfig reducedMotion="user">
        <div className="flex min-h-screen flex-col">
          <Header />
          {/* Not AnimatePresence initial={false} / m.main initial={false}: both
              propagate through PresenceContext/MotionContext and suppress every
              descendant's mount animation (hero clouds included) on hard reload.
              An *object* initial does not cascade, so descendants animate freely
              while the landing <main> itself paints visible. */}
          <AnimatePresence mode="wait">
            <m.main
              key={location.pathname}
              className="flex-1"
              initial={isFirstRoute.current ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              {/* Public pages other than Home are route-split (see App.tsx).
                  The boundary sits inside <main> so Header and Footer stay
                  mounted while a page chunk loads. */}
              <Suspense
                fallback={
                  <div className="min-h-[60vh]" role="status" aria-live="polite" aria-busy="true">
                    <span className="sr-only">Cargando…</span>
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </m.main>
          </AnimatePresence>
          <Footer />
          <WhatsAppWidget />
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}

export { Layout }
