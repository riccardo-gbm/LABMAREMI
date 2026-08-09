import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import { LazyMotion, MotionConfig, domMax } from "framer-motion"

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import WhatsAppWidget from "@/components/layout/WhatsAppWidget"

function Layout() {
  return (
    // domMax (not domAnimation) because Header and CatalogPage use layoutId/layout
    // shared-element animations, which need the layout-projection feature set.
    <LazyMotion features={domMax}>
      <MotionConfig reducedMotion="user">
        <div className="flex min-h-screen flex-col">
          <Header />
          {/* Standard main container: AnimatePresence mode="wait" at the layout level
              intercepts route changes and causes layout-projection conflicts when
              descendants mount layout elements during exit transitions. Page-level
              micro-animations (Reveal, RevealGroup, etc.) animate their own content. */}
          <main className="flex-1">
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
          </main>
          <Footer />
          <WhatsAppWidget />
        </div>
      </MotionConfig>
    </LazyMotion>
  )
}

export { Layout }
