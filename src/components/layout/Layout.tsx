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
                <div
                  className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <div className="mb-6 flex items-center gap-2">
                    <div className="h-4 w-16 rounded bg-muted/60" />
                    <div className="h-4 w-4 rounded bg-muted/40" />
                    <div className="h-4 w-24 rounded bg-muted/60" />
                    <div className="h-4 w-4 rounded bg-muted/40" />
                    <div className="h-4 w-32 rounded bg-muted/60" />
                  </div>
                  <div className="grid gap-10 animate-pulse lg:grid-cols-[2fr_3fr] lg:gap-14">
                    <div className="aspect-square rounded-xl border border-primary/10 bg-muted/60" />
                    <div className="space-y-4">
                      <div className="h-4 w-32 rounded bg-muted/60" />
                      <div className="h-6 w-24 rounded-full bg-muted/60" />
                      <div className="h-9 w-3/4 rounded bg-muted/60" />
                      <div className="h-16 w-full rounded bg-muted/60" />
                      <div className="space-y-2 pt-4">
                        <div className="h-14 w-full rounded-lg bg-muted/60" />
                        <div className="h-14 w-full rounded-lg bg-muted/60" />
                      </div>
                    </div>
                  </div>
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
