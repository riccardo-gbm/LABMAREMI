import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react"

import type { MoltenRingItem } from "@/components/ui/molten-ring-carousel"
import { cn } from "@/lib/utils"

// The WebGL carousel sits below the hero on the eager HomePage, so it gets its
// own chunk instead of weighing on the LCP bundle.
const MoltenRingCarousel = lazy(() => import("@/components/ui/molten-ring-carousel"))

// One benefit per picture, in scroll order: each line fades in while its
// image is at the front. Keep every `line` to seven words or fewer.
const slides = [
  {
    image: "/delivery-truck.webp",
    alt: "Camión de reparto en carretera con carga hacia el cliente",
    title: "Entregas inmediatas",
    line: "Mismo día o en hasta 48 horas.",
  },
  {
    image: "/warehouse-inventory.webp",
    alt: "Bodega con inventario de químicos, papel, fundas, herramientas de limpieza y protección",
    title: "Continuidad de inventario",
    line: "Reposición planificada de sus productos diarios.",
  },
  {
    image: "/cat-materiales-limpieza.webp",
    alt: "Paños de microfibra, mopa, almohadillas, cepillo y esponjas para limpieza profesional",
    title: "Catálogo completo",
    line: "Limpieza, higiene y protección en un proveedor.",
  },
  {
    // Unsplash sends CORS headers, which the WebGL texture upload requires.
    image:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=900&auto=format&fit=crop",
    alt: "Guantes y protección para equipos operativos",
    title: "Atención personalizada",
    line: "Cotizaciones y asesoría según su negocio.",
  },
]

const gallery: MoltenRingItem[] = slides.map(({ image, alt, title }) => ({
  image,
  alt,
  title,
}))

const STEPS = slides.length - 1
/** Scroll held on the first and last picture before the ring moves or the
    section lets go, in steps. */
const DWELL = 0.35
/** Page scroll spent per picture change, in svh. */
const STEP_SVH = 70

/** Card width / height, matching the 4:5 art. */
const CARD_RATIO = 0.8

interface RingLayout {
  /** Card height, as a fraction of the stage height... */
  cardSize: number
  /** ...unless that would make it wider than this fraction of the stage. */
  maxCardWidth: number
  /** Front card's centre, as a fraction of the stage height from the top. */
  focus: number
  /** Centre to centre, in card heights. */
  spacing: number
}

// lg+: the card sits between the two text columns, with its neighbours
// peeking in at the top and bottom edges.
const DESKTOP_RING: RingLayout = {
  cardSize: 0.6,
  maxCardWidth: 0.4,
  focus: 0.5,
  spacing: 1.25,
}

/* Below lg the intro stays pinned at the top and the card fills whatever room
   is left between it and the benefit - which depends on how the copy wraps -
   so the card is fitted to a measured slot instead of fixed fractions. */
const MOBILE_MAX_WIDTH = 0.8
/** Clear space inside the slot above the card (under the intro's fade) and
    below it, in px. */
const SLOT_TOP = 20
const SLOT_BOTTOM = 10
const MIN_CARD = 140
/** Until the slot is first measured. */
const MOBILE_FALLBACK: RingLayout = {
  cardSize: 0.45,
  maxCardWidth: MOBILE_MAX_WIDTH,
  focus: 0.6,
  spacing: 2,
}

const sameRing = (a: RingLayout, b: RingLayout) =>
  Math.abs(a.cardSize - b.cardSize) < 1e-3 &&
  Math.abs(a.focus - b.focus) < 1e-3 &&
  Math.abs(a.spacing - b.spacing) < 1e-3

/** The desktop card's rendered width in CSS, from the same terms the canvas
    sizes it by - so the text columns can meet it without measuring. */
const stageVars = {
  "--ring-card-w": `calc(min(${DESKTOP_RING.cardSize * 100}cqh, ${(DESKTOP_RING.maxCardWidth / CARD_RATIO) * 100}cqw) * ${CARD_RATIO})`,
} as CSSProperties

/** Below lg the benefit sits right under the card, where each incoming card
    passes on its way up - so it shows only while its own card is at, or about
    to settle into, the front. In steps either side of the card. */
const MOBILE_SHOW_FROM = -0.02
const MOBILE_SHOW_UNTIL = 0.3

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))

/** Holds still around each whole step and moves between them, so every
    picture gets a moment at the front before the next one rises. */
const settle = (x: number) => {
  const whole = Math.floor(x)
  const t = x - whole
  return whole + t - Math.sin(2 * Math.PI * t) / (2 * Math.PI)
}

const DESKTOP = "(min-width: 1024px)"
const subscribeDesktop = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const readDesktop = () => window.matchMedia(DESKTOP).matches

function Intro() {
  return (
    <>
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl xl:text-3xl">
        ¿Quiénes somos?
      </h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:mt-4 lg:text-lg xl:text-m">
        LABMAREMI es un distribuidor que centraliza todos los productos de
        limpieza, protección e higiene para su negocio.
      </p>
    </>
  )
}

/** All four stay mounted in one cell so the box never changes height and
    screen readers get the full list; only the active one is visible. */
function Benefits({
  active,
  shown,
  className,
}: {
  active: number
  shown: boolean
  className?: string
}) {
  return (
    <div className={cn("grid", className)}>
      {slides.map((slide, i) => (
        <div
          key={slide.title}
          className={cn(
            "col-start-1 row-start-1 transition duration-400 ease-out motion-reduce:transition-none",
            i === active && shown
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0",
          )}
        >
          <h3 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl xl:text-2xl">
            {slide.title}
          </h3>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground md:text-lg lg:mt-3 xl:text-m">
            {slide.line}
          </p>
        </div>
      ))}
    </div>
  )
}

/**
 * "¿Quiénes somos?" intro beside a scroll-driven image ring. The stage pins
 * under the header while the page scroll walks the ring from the first
 * picture to the last - swapping the benefit text with each one - and then
 * releases so the page carries on. Nothing here is clickable; the page
 * scroll is the only control.
 */
export function AboutBenefitsSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  // Fractional position along the ring, in pictures. Written on scroll and
  // read by the canvas every frame, so it never re-renders this component.
  const progress = useRef(0)
  /** The picture nearest the front. */
  const [active, setActive] = useState(0)
  /** Whether its benefit is showing; always on lg+, where the text sits beside the card. */
  const [textShown, setTextShown] = useState(true)
  const [mobileRing, setMobileRing] = useState(MOBILE_FALLBACK)
  const desktop = useSyncExternalStore(subscribeDesktop, readDesktop)

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    const slot = slotRef.current
    if (!track || !stage || !slot) return
    // Layout is read on resize only, so a scroll event costs a single rect
    // read and no style recalculation.
    let travel = 0
    let pinnedAt = 0
    const update = () => {
      if (travel <= 0) return
      const scrolled = pinnedAt - track.getBoundingClientRect().top
      const raw = clamp(scrolled / travel, 0, 1)
      const position = settle(
        clamp(raw * (STEPS + 2 * DWELL) - DWELL, 0, STEPS),
      )
      progress.current = position
      const nearest = Math.round(position)
      const offset = position - nearest
      // Both bail out when unchanged, so this re-renders only on a switch.
      setActive(nearest)
      setTextShown(
        desktop || (offset >= MOBILE_SHOW_FROM && offset <= MOBILE_SHOW_UNTIL),
      )
    }
    /** Sizes the card to the slot between the pinned intro and the benefit. */
    const fitMobile = () => {
      const height = stage.clientHeight
      const width = stage.clientWidth
      if (desktop || !height || !width) return
      const room = slot.offsetHeight - SLOT_TOP - SLOT_BOTTOM
      const card = clamp(room, MIN_CARD, (width * MOBILE_MAX_WIDTH) / CARD_RATIO)
      // The stage is sticky, so it is the slot's offset parent.
      const centre = slot.offsetTop + SLOT_TOP + room / 2
      // At rest the next card must sit wholly below the stage so it never
      // peeks under the benefit; its tilt adds a little over half a card.
      const spacing = clamp(((height - centre) / card + 0.6) / 0.98, 1.6, 3)
      const next = {
        cardSize: card / height,
        maxCardWidth: MOBILE_MAX_WIDTH,
        focus: centre / height,
        spacing,
      }
      setMobileRing((prev) => (sameRing(prev, next) ? prev : next))
    }
    const measure = () => {
      travel = track.offsetHeight - stage.offsetHeight
      // Where the stage pins - the header's height, read from its own `top`
      // so the two cannot drift apart.
      pinnedAt = parseFloat(getComputedStyle(stage).top) || 0
      fitMobile()
      update()
    }
    measure()
    // The slot moves when the intro or benefit rewraps - a font arriving,
    // a rotation - without the stage itself changing size.
    const resizer = new ResizeObserver(measure)
    resizer.observe(track)
    resizer.observe(stage)
    resizer.observe(slot)
    // Handled directly rather than deferred to a frame: scroll events already
    // arrive once per frame, ahead of the canvas's own frame callback.
    window.addEventListener("scroll", update, { passive: true })
    return () => {
      resizer.disconnect()
      window.removeEventListener("scroll", update)
    }
  }, [desktop])

  const ring = desktop ? DESKTOP_RING : mobileRing

  return (
    <section id="quienes-somos" className="bg-background">
      <div
        ref={trackRef}
        style={{
          height: `calc(100svh - 4rem + ${(STEPS + 2 * DWELL) * STEP_SVH}svh)`,
        }}
      >
        {/* top-16 sits the stage under the sticky header (h-16). A size
            container, so the desktop columns can be sized by the card. */}
        <div
          ref={stageRef}
          className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col overflow-hidden [container-type:size]"
          style={stageVars}
        >
          <Suspense fallback={null}>
            <MoltenRingCarousel
              items={gallery}
              label="Imágenes de LABMAREMI"
              labels={false}
              scrollProgress={progress}
              activeIndex={active}
              fit="height"
              cardRatio={CARD_RATIO}
              cardSize={ring.cardSize}
              maxCardWidth={ring.maxCardWidth}
              focus={ring.focus}
              spacing={ring.spacing}
              arc={8}
              className="absolute inset-0"
            />
          </Suspense>

          {/* Below lg: the intro stays pinned above the card for the whole
              run. It is opaque, so a card leaving upward slides under it the
              way it would under the header; the fade softens that edge. */}
          <div className="relative z-10 bg-background px-4 pt-8 sm:px-6 lg:hidden">
            <div className="mx-auto max-w-6xl">
              <Intro />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-full h-5 bg-gradient-to-b from-background to-transparent"
            />
          </div>
          {/* The room the front card is fitted to. */}
          <div ref={slotRef} aria-hidden="true" className="min-h-0 flex-1 lg:hidden" />
          <Benefits
            active={active}
            shown={textShown}
            className="relative px-4 text-center sm:px-6 lg:hidden"
          />
          {/* Keeps the benefit clear of the floating WhatsApp button. */}
          <div aria-hidden="true" className="h-[4.75rem] shrink-0 lg:hidden" />

          {/* lg+: symmetric columns keep the centre one on the viewport
              centre, which is where the ring draws its front card; it is
              exactly the card's width, so the text runs right up to it. */}
          <div className="pointer-events-none absolute inset-0 mx-auto hidden w-full max-w-[88rem] px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--ring-card-w)_minmax(0,1fr)] lg:items-center lg:gap-x-12 xl:gap-x-16">
            <div className="pointer-events-auto">
              <Intro />
            </div>
            <div aria-hidden="true" />
            <Benefits
              active={active}
              shown={textShown}
              className="pointer-events-auto text-left"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
