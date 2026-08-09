import { useState, useEffect, useMemo, useRef } from "react";
import {
  m,
  animate,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

const IMG_WIDTH = 70;
const IMG_HEIGHT = 95;
const TOTAL_IMAGES = 20;

// Intro choreography, single source of truth.
const INTRO_SPRING = { stiffness: 70, damping: 18 } as const;
const INTRO_LINE_MS = 300;
const INTRO_CIRCLE_MS = 1200;

// Product and team/workplace shots interleaved on purpose so the circle doesn't
// read as visually segregated. Decorative brand imagery, not "meet our team" —
// that's the section further down the page. Swap in real LABMAREMI photos later;
// only this array needs to change.
// w=220 covers IMG_WIDTH/IMG_HEIGHT (70x95) at ~3x DPR — all 20 fetch eagerly
// (see FlipCard), so oversizing here is 20x the usual cost. Don't bump toward
// w=400 without re-checking payload; that was ~600KB total for this array alone.
const IMAGES = [
  // Blue nitrile gloves forming a heart
  "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=220&auto=format&fit=crop",
  // Tall warehouse aisle with stocked shelves
  "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=220&auto=format&fit=crop",
  // Rubber glove holding a yellow spray bottle
  "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=220&auto=format&fit=crop",
  // Team working around a shared table
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=220&auto=format&fit=crop",
  // Paper roll in a gloved hand over stacked stock
  "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?q=80&w=220&auto=format&fit=crop",
  // Handing over a boxed delivery
  "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=220&auto=format&fit=crop",
  // Gloved hands disinfecting a surface
  "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?q=80&w=220&auto=format&fit=crop",
  // Colleagues celebrating at an office desk
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=220&auto=format&fit=crop",
  // Natural cleaner spray bottle with lemons
  "https://images.unsplash.com/photo-1583907659441-addbe699e921?q=80&w=220&auto=format&fit=crop",
  // Distribution warehouse with organized bins
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=220&auto=format&fit=crop",
  // Glass-cleaner spray bottle with paper towel roll
  "https://images.unsplash.com/photo-1550963295-019d8a8a61c5?q=80&w=220&auto=format&fit=crop",
  // Team collaborating over laptops
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=220&auto=format&fit=crop",
  // Hand sanitizer bottle with face mask
  "https://images.unsplash.com/photo-1584744982491-665216d95f8b?q=80&w=220&auto=format&fit=crop",
  // Delivery van loaded with parcels
  "https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=220&auto=format&fit=crop",
  // Spotless kitchen ready for service
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=220&auto=format&fit=crop",
  // Team hands stacked together
  "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=220&auto=format&fit=crop",
  // Putting on blue nitrile gloves
  "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=220&auto=format&fit=crop",
  // Forklift moving stock in a warehouse
  "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=220&auto=format&fit=crop",
  // Spotless washroom after cleaning
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=220&auto=format&fit=crop",
  // Planning meeting in a conference room
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=220&auto=format&fit=crop",
];

interface Size {
  width: number;
  height: number;
}

interface ScatterPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface CardTarget {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

function linePosition(index: number) {
  const lineSpacing = 78;
  const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
  return { x: index * lineSpacing - lineTotalWidth / 2, y: 0, rotation: 0, scale: 1 };
}

function circlePosition(index: number, size: Size) {
  const isMobile = size.width < 768;
  const minDimension = Math.min(size.width, size.height);
  // On phones a 0.35×height radius packs 20 cards into a solid pile and
  // buries the headline; widen the ring past the screen edges instead.
  const circleRadius = isMobile ? size.width * 0.44 : Math.min(minDimension * 0.35, 350);
  const circleAngle = (index / TOTAL_IMAGES) * 360;
  const circleRad = (circleAngle * Math.PI) / 180;
  return {
    x: Math.cos(circleRad) * circleRadius,
    y: Math.sin(circleRad) * circleRadius,
    rotation: circleAngle + 90,
    scale: 1,
  };
}

function arcPosition(index: number, size: Size, scrollProgress01: number, parallaxPx: number) {
  const isMobile = size.width < 768;
  const baseRadius = Math.min(size.width, size.height * 1.5);
  const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
  const arcApexY = size.height * (isMobile ? 0.35 : 0.25);
  const arcCenterY = arcApexY + arcRadius;
  const spreadAngle = isMobile ? 100 : 130;
  const startAngle = -90 - spreadAngle / 2;
  const step = spreadAngle / (TOTAL_IMAGES - 1);
  const maxRotation = spreadAngle * 0.8;
  const boundedRotation = -scrollProgress01 * maxRotation;
  const currentArcAngle = startAngle + index * step + boundedRotation;
  const arcRad = (currentArcAngle * Math.PI) / 180;
  return {
    x: Math.cos(arcRad) * arcRadius + parallaxPx,
    y: Math.sin(arcRad) * arcRadius + arcCenterY,
    rotation: currentArcAngle + 90,
    scale: isMobile ? 1.4 : 1.8,
  };
}

/** Where a card sits for a given animation state. `intro` runs 0 (scatter) →
 * 1 (line) → 2 (circle); past 1 the destination blends circle → scroll arc by
 * `morph`. Pure math on numbers already read from motion values, so it runs
 * inside motion's frame loop without touching React. */
function cardTarget(
  index: number,
  scatter: ScatterPosition,
  intro: number,
  morph: number,
  rotate01: number,
  parallaxPx: number,
  size: Size,
): CardTarget {
  const line = linePosition(index);
  if (intro <= 1) {
    const t = clamp01(intro);
    return {
      x: lerp(scatter.x, line.x, t),
      y: lerp(scatter.y, line.y, t),
      rotation: lerp(scatter.rotation, line.rotation, t),
      scale: lerp(scatter.scale, line.scale, t),
      opacity: t,
    };
  }
  const t = clamp01(intro - 1);
  const circle = circlePosition(index, size);
  const arc = arcPosition(index, size, rotate01, parallaxPx);
  const end = {
    x: lerp(circle.x, arc.x, morph),
    y: lerp(circle.y, arc.y, morph),
    rotation: lerp(circle.rotation, arc.rotation, morph),
    scale: lerp(circle.scale, arc.scale, morph),
  };
  return {
    x: lerp(line.x, end.x, t),
    y: lerp(line.y, end.y, t),
    rotation: lerp(line.rotation, end.rotation, t),
    scale: lerp(line.scale, end.scale, t),
    opacity: 1,
  };
}

interface FlipCardProps {
  index: number;
  src: string;
  scatter: ScatterPosition;
  intro: MotionValue<number>;
  morph: MotionValue<number>;
  rotate: MotionValue<number>;
  parallax: MotionValue<number>;
  size: Size;
}

/** Fully motion-value driven: position/rotation/scale/opacity are derived
 * values written straight to style inside motion's frame loop. No React state
 * changes per frame — the component renders once per resize, not per frame. */
function FlipCard({ index, src, scatter, intro, morph, rotate, parallax, size }: FlipCardProps) {
  const target = useTransform(
    [intro, morph, rotate, parallax],
    ([i, m, r, p]: number[]) => cardTarget(index, scatter, i, m, clamp01(r / 360), p, size)
  );

  const x = useTransform(target, t => t.x);
  const y = useTransform(target, t => t.y);
  const rotation = useTransform(target, t => t.rotation);
  const scale = useTransform(target, t => t.scale);
  const opacity = useTransform(target, t => t.opacity);

  return (
    <m.div
      style={{
        x,
        y,
        rotate: rotation,
        scale,
        opacity,
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
      }}
      className="cursor-pointer group"
    >
      <m.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        <div className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-slate-200" style={{ backfaceVisibility: "hidden" }}>
          {/* Not loading="lazy": all 20 live inside the sticky hero viewport,
              lazy only delays them behind the entrance animation. Low fetch
              priority keeps them from competing with the page chunk and text. */}
          <img
            src={src}
            alt=""
            width={IMG_WIDTH}
            height={IMG_HEIGHT}
            decoding="async"
            fetchPriority="low"
            className="h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
        </div>
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-slate-200"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Counter-mirror so the photo reads identical to the front, not flipped */}
          <img
            src={src}
            alt=""
            width={IMG_WIDTH}
            height={IMG_HEIGHT}
            decoding="async"
            fetchPriority="low"
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
            draggable={false}
          />
        </div>
      </m.div>
    </m.div>
  );
}

export default function AboutHeroMorph() {
  const [containerSize, setContainerSize] = useState<Size>({ width: 0, height: 0 });
  const stickyRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!stickyRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(stickyRef.current);
    setContainerSize({ width: stickyRef.current.offsetWidth, height: stickyRef.current.offsetHeight });
    return () => observer.disconnect();
  }, []);

  // Real scroll progress across the tall wrapper section below — no wheel/touch
  // interception, no preventDefault. Normal page scroll drives this directly.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const morphProgress = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });
  const scrollRotate = useTransform(scrollYProgress, [0.2, 1], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const el = stickyRef.current;
    if (!el || prefersReducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 80);
    };
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, prefersReducedMotion]);

  // One spring-smoothed progress value drives the whole intro instead of the
  // old phase state machine: the timers write to a motion value, so the intro
  // never re-renders React. One spring along the segment ≡ identical params per
  // coordinate, so the cards stay in formation.
  const introTarget = useMotionValue(0);
  const introProgress = useSpring(introTarget, INTRO_SPRING);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t1 = setTimeout(() => introTarget.set(1), INTRO_LINE_MS);
    const t2 = setTimeout(() => introTarget.set(2), INTRO_CIRCLE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [prefersReducedMotion, introTarget]);

  // 0 hidden → 1 revealed. Triggered when introProgress reaches circle completion (>= 1.92).
  const headlineGate = useMotionValue(0);
  const fadeRef = useRef<AnimationPlaybackControls | undefined>(undefined);
  const revealedRef = useRef(false);

  useMotionValueEvent(introProgress, "change", (latest) => {
    if (prefersReducedMotion) return;
    if (latest >= 1.92 && !revealedRef.current) {
      revealedRef.current = true;
      fadeRef.current = animate(headlineGate, 1, { duration: 0.5, ease: "easeOut" });
    }
  });

  useEffect(
    () => () => {
      fadeRef.current?.stop();
    },
    [],
  );

  const scatterPositions = useMemo<ScatterPosition[]>(
    () =>
      IMAGES.map(() => ({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 1000,
        rotation: (Math.random() - 0.5) * 180,
        scale: 0.6,
      })),
    []
  );

  // The headline is gated behind the intro on purpose: the line beat parks all
  // 20 cards at y:0, straight through the centered headline, and showing the
  // phrase under that sweep reads as a layout bug. It fades in HEADLINE_BEAT_MS
  // after the circle settles. That makes it the LCP element at ~2.2s from mount
  // rather than at first paint — INTRO_LINE_MS/INTRO_CIRCLE_MS/INTRO_SPRING are
  // tuned to keep it under 2.5s, so slowing the intro regresses /nosotros LCP.
  // The second factor is the separate scroll-driven fade-*out*.
  const headlineOpacity = useTransform(
    () => headlineGate.get() * clamp01(1 - smoothMorph.get() / 0.4),
  );
  // Trails inside the same fade instead of running its own timer.
  const hintOpacity = useTransform(headlineGate, [0.6, 1], [0, 0.6]);

  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  // Reduced-motion users get both text blocks and a plain image grid immediately —
  // no scroll-driven sequence, no scatter/line/circle intro, normal document flow.
  if (prefersReducedMotion) {
    return (
      <section className="relative py-20 px-4 text-center bg-[#FAFAFA]">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Su satisfacción es nuestro éxito
        </h1>
        <p className="mt-4 text-slate-600 max-w-lg mx-auto">
          Cinco años cuidando la higiene de su negocio. Desde Quito, LABMAREMI abastece a
          restaurantes, hoteles, oficinas e instituciones en la ciudad y provincias cercanas
          con un servicio confiable.
        </p>
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3">
          {IMAGES.map((src) => (
            <div key={src} className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-200 shadow-sm">
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[300vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden bg-[#FAFAFA]">
        <div className="flex h-full w-full flex-col items-center justify-center">
          {/* z-10 so the line-phase card sweep passes behind the headline. Only
              opacity animates and the wrapper is already out of flow, so the
              gated reveal costs no layout shift. */}
          <m.div
            style={{ opacity: headlineOpacity }}
            className="absolute z-10 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4"
          >
            <h1 className="max-w-[13rem] text-2xl font-bold tracking-tight text-slate-900 md:max-w-sm md:text-4xl">
              Su satisfacción es nuestro éxito
            </h1>
            <m.p
              style={{ opacity: hintOpacity }}
              className="mt-4 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase"
            >
              Desliza para explorar
            </m.p>
          </m.div>

          <m.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="absolute top-[28%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4 md:top-[24%]"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Cinco años cuidando la higiene de su negocio.
            </h2>
            <p className="text-sm md:text-base text-slate-600 max-w-lg leading-relaxed">
              Desde Quito, LABMAREMI abastece a restaurantes, hoteles, oficinas e instituciones
              en la ciudad y provincias cercanas con un servicio confiable.
            </p>
          </m.div>

          <div className="relative flex items-center justify-center w-full h-full">
            {IMAGES.map((src, i) => (
              <FlipCard
                key={src}
                index={i}
                src={src}
                scatter={scatterPositions[i]}
                intro={introProgress}
                morph={smoothMorph}
                rotate={smoothScrollRotate}
                parallax={smoothMouseX}
                size={containerSize}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
