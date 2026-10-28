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
// Below lg: a larger share of the screen, raised so the benefit fits under it
// and clear of the WhatsApp button. Neighbours are kept off-stage at rest.
const MOBILE_RING: RingLayout = {
  cardSize: 0.5,
  maxCardWidth: 0.8,
  focus: 0.42,
  spacing: 1.85,
}

/** The card's rendered height in CSS, from the same terms the canvas sizes it
    by - so the text can be laid against it without measuring the canvas. */
const cardHeight = ({ cardSize, maxCardWidth }: RingLayout) =>
  `min(${cardSize * 100}cqh, ${(maxCardWidth / CARD_RATIO) * 100}cqw)`

const stageVars = {
  "--ring-card-w": `calc(${cardHeight(DESKTOP_RING)} * ${CARD_RATIO})`,
  "--ring-text-top": `calc(${MOBILE_RING.focus * 100}cqh + ${cardHeight(MOBILE_RING)} / 2 + 1.5rem)`,
} as CSSProperties

/** Below lg the benefit sits right under the card, where each incoming card
    passes on its way up - so it shows only while its own card is at, or about
    to settle into, the front. In steps either side of the card. */
const MOBILE_SHOW_FROM = -0.05
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
      <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl xl:text-5xl">
        ¿Quiénes somos?
      </h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:mt-5 lg:text-lg xl:text-xl">
        LABMAREMI es un distribuidor que centraliza todos los productos de
        limpieza, protección e higiene para su negocio.
      </p>
    </>
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
  // Fractional position along the ring, in pictures. Written on scroll and
  // read by the canvas every frame, so it never re-renders this component.
  const progress = useRef(0)
  /** The picture nearest the front. */
  const [active, setActive] = useState(0)
  /** Whether its benefit is showing; always on lg+, where the text sits beside the card. */
  const [textShown, setTextShown] = useState(true)
  const desktop = useSyncExternalStore(subscribeDesktop, readDesktop)

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return
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
    const measure = () => {
      travel = track.offsetHeight - stage.offsetHeight
      // Where the stage pins - the header's height, read from its own `top`
      // so the two cannot drift apart.
      pinnedAt = parseFloat(getComputedStyle(stage).top) || 0
      update()
    }
    measure()
    const resizer = new ResizeObserver(measure)
    resizer.observe(track)
    resizer.observe(stage)
    // Handled directly rather than deferred to a frame: scroll events already
    // arrive once per frame, ahead of the canvas's own frame callback.
    window.addEventListener("scroll", update, { passive: true })
    return () => {
      resizer.disconnect()
      window.removeEventListener("scroll", update)
    }
  }, [desktop])

  const ring = desktop ? DESKTOP_RING : MOBILE_RING

  return (
    <section id="quienes-somos" className="bg-background">
      {/* Below lg the intro scrolls past normally; the pinned stage only has
          room for the picture and its benefit. */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6 md:pt-16 lg:hidden">
        <Intro />
      </div>

      <div
        ref={trackRef}
        style={{
          height: `calc(100svh - 4rem + ${(STEPS + 2 * DWELL) * STEP_SVH}svh)`,
        }}
      >
        {/* top-16 sits the stage under the sticky header (h-16). A size
            container, so the text can be placed by the card's own terms. */}
        <div
          ref={stageRef}
          className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden [container-type:size]"
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

          {/* Symmetric columns keep the centre one on the viewport centre,
              which is where the ring draws its front card; it is exactly the
              card's width, so the text runs right up to it. */}
          <div className="pointer-events-none relative mx-auto h-full w-full max-w-[88rem] px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--ring-card-w)_minmax(0,1fr)] lg:items-center lg:gap-x-12 lg:px-8 xl:gap-x-16">
            <div className="pointer-events-auto hidden lg:block">
              <Intro />
            </div>
            <div className="hidden lg:block" aria-hidden="true" />

            {/* All four stay mounted in one cell so the box never changes
                height and screen readers get the full list. Below lg it hangs
                just under the card. */}
            <div className="pointer-events-auto absolute inset-x-4 top-[var(--ring-text-top)] grid text-center sm:inset-x-6 lg:static lg:text-left">
              {slides.map((slide, i) => (
                <div
                  key={slide.title}
                  className={cn(
                    "col-start-1 row-start-1 transition duration-400 ease-out motion-reduce:transition-none",
                    i === active && textShown
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0",
                  )}
                >
                  <h3 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl xl:text-4xl">
                    {slide.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground md:text-lg lg:mt-3 xl:text-xl">
                    {slide.line}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
