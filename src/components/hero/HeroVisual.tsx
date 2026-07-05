import { Droplets } from "lucide-react"

/**
 * Placeholder for the Home hero's 3D scene.
 *
 * Phase 1 renders a clinical "specimen panel" — a framed blue/cyan field with
 * a fine grid, floating product-container glyphs, and a spec caption. It is
 * deliberately isolated so the Spline scene (`@splinetool/react-spline`) can be
 * lazy-loaded in here later without touching HeroSection or the rest of the
 * page. Treat this as a visual enhancement, not business logic.
 */
function HeroVisual() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary via-[oklch(0.55_0.2_255)] to-ring shadow-xl sm:aspect-[4/3] lg:aspect-square">
      {/* Fine technical grid, evokes a lab worksheet */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating abstract containers — cleanliness in motion */}
      <div
        aria-hidden="true"
        className="animate-float absolute left-[14%] top-[18%] h-20 w-16 rounded-lg border border-white/40 bg-white/15 backdrop-blur-sm"
      />
      <div
        aria-hidden="true"
        className="animate-float-slow absolute right-[16%] top-[26%] h-24 w-24 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm"
      />
      <div
        aria-hidden="true"
        className="animate-float-slow absolute bottom-[20%] left-[24%] h-16 w-20 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm"
      />

      {/* Center mark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/40 bg-white/15 backdrop-blur-sm">
          <Droplets className="h-8 w-8" aria-hidden="true" />
        </span>
        <span className="mt-4 font-display text-lg font-semibold tracking-tight">
          LABMAREMI
        </span>
      </div>

      {/* Spec caption, bottom-left — marks this as the future 3D slot */}
      <p className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
        Animación 3D · próximamente
      </p>
    </div>
  )
}

export { HeroVisual }
