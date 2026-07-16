import { Outlet } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { AnimatePresence, motion, MotionConfig } from "framer-motion"

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import WhatsAppWidget from "@/components/layout/WhatsAppWidget"

function Layout() {
  const location = useLocation()

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <Header />
        {/* No initial={false} here: it would propagate through PresenceContext and
            suppress every descendant animation (hero clouds included) on hard reload. */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="flex-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        <Footer />
        <WhatsAppWidget />
      </div>
    </MotionConfig>
  )
}

export { Layout }
