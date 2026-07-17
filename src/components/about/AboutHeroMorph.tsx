import { useState, useEffect, useMemo, useRef } from "react";
import { m, useTransform, useSpring, useMotionValue, useScroll, useMotionValueEvent } from "framer-motion";

type AnimationPhase = "scatter" | "line" | "circle";

interface FlipCardProps {
  src: string;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

const IMG_WIDTH = 70;
const IMG_HEIGHT = 95;

function FlipCard({ src, target }: FlipCardProps) {
  return (
    <m.div
      animate={{ x: target.x, y: target.y, rotate: target.rotation, scale: target.scale, opacity: target.opacity }}
      transition={{ type: "spring", stiffness: 40, damping: 15 }}
      style={{ position: "absolute", width: IMG_WIDTH, height: IMG_HEIGHT, transformStyle: "preserve-3d" }}
      className="cursor-pointer group"
    >
      <m.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        <div className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-slate-200" style={{ backfaceVisibility: "hidden" }}>
          <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
        </div>
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-slate-200"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Counter-mirror so the photo reads identical to the front, not flipped */}
          <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" style={{ transform: "scaleX(-1)" }} draggable={false} />
        </div>
      </m.div>
    </m.div>
  );
}

const TOTAL_IMAGES = 20;

// Product and team/workplace shots interleaved on purpose so the circle doesn't
// read as visually segregated. Decorative brand imagery, not "meet our team" —
// that's the section further down the page. Swap in real LABMAREMI photos later;
// only this array needs to change.
const IMAGES = [
  // Blue nitrile gloves forming a heart
  "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=400",
  // Tall warehouse aisle with stocked shelves
  "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=400",
  // Rubber glove holding a yellow spray bottle
  "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=400",
  // Team working around a shared table
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400",
  // Paper roll in a gloved hand over stacked stock
  "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?q=80&w=400",
  // Handing over a boxed delivery
  "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=400",
  // Gloved hands disinfecting a surface
  "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?q=80&w=400",
  // Colleagues celebrating at an office desk
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=400",
  // Natural cleaner spray bottle with lemons
  "https://images.unsplash.com/photo-1583907659441-addbe699e921?q=80&w=400",
  // Distribution warehouse with organized bins
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400",
  // Glass-cleaner spray bottle with paper towel roll
  "https://images.unsplash.com/photo-1550963295-019d8a8a61c5?q=80&w=400",
  // Team collaborating over laptops
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=400",
  // Hand sanitizer bottle with face mask
  "https://images.unsplash.com/photo-1584744982491-665216d95f8b?q=80&w=400",
  // Delivery van loaded with parcels
  "https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=400",
  // Spotless kitchen ready for service
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=400",
  // Team hands stacked together
  "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=400",
  // Putting on blue nitrile gloves
  "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=400",
  // Forklift moving stock in a warehouse
  "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=400",
  // Spotless washroom after cleaning
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400",
  // Planning meeting in a conference room
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400",
];

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function AboutHeroMorph() {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
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

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t1 = setTimeout(() => setIntroPhase("line"), 500);
    const t2 = setTimeout(() => setIntroPhase("circle"), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [prefersReducedMotion]);

  const scatterPositions = useMemo(
    () =>
      IMAGES.map(() => ({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 1000,
        rotation: (Math.random() - 0.5) * 180,
        scale: 0.6,
        opacity: 0,
      })),
    []
  );

  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useMotionValueEvent(smoothMorph, "change", setMorphValue);
  useMotionValueEvent(smoothScrollRotate, "change", setRotateValue);
  useMotionValueEvent(smoothMouseX, "change", setParallaxValue);

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
          <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4">
            <m.h1
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: 1 }}
              className="max-w-[13rem] text-2xl font-bold tracking-tight text-slate-900 md:max-w-sm md:text-4xl"
            >
              Su satisfacción es nuestro éxito
            </m.h1>
            <m.p
              initial={{ opacity: 0 }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 0.6 - morphValue }
                  : { opacity: 0 }
              }
              transition={{ duration: 1, delay: 0.2 }}
              className="mt-4 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase"
            >
              Desliza para explorar
            </m.p>
          </div>

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
            {IMAGES.map((src, i) => {
              let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

              if (introPhase === "scatter") {
                target = scatterPositions[i];
              } else if (introPhase === "line") {
                const lineSpacing = 78;
                const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                target = { x: i * lineSpacing - lineTotalWidth / 2, y: 0, rotation: 0, scale: 1, opacity: 1 };
              } else {
                const isMobile = containerSize.width < 768;
                const minDimension = Math.min(containerSize.width, containerSize.height);
                // On phones a 0.35×height radius packs 20 cards into a solid pile and
                // buries the headline; widen the ring past the screen edges instead.
                const circleRadius = isMobile
                  ? containerSize.width * 0.44
                  : Math.min(minDimension * 0.35, 350);
                const circleAngle = (i / TOTAL_IMAGES) * 360;
                const circleRad = (circleAngle * Math.PI) / 180;
                const circlePos = {
                  x: Math.cos(circleRad) * circleRadius,
                  y: Math.sin(circleRad) * circleRadius,
                  rotation: circleAngle + 90,
                };

                const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
                const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
                const arcCenterY = arcApexY + arcRadius;
                const spreadAngle = isMobile ? 100 : 130;
                const startAngle = -90 - spreadAngle / 2;
                const step = spreadAngle / (TOTAL_IMAGES - 1);
                const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
                const maxRotation = spreadAngle * 0.8;
                const boundedRotation = -scrollProgress * maxRotation;
                const currentArcAngle = startAngle + i * step + boundedRotation;
                const arcRad = (currentArcAngle * Math.PI) / 180;
                const arcPos = {
                  x: Math.cos(arcRad) * arcRadius + parallaxValue,
                  y: Math.sin(arcRad) * arcRadius + arcCenterY,
                  rotation: currentArcAngle + 90,
                  scale: isMobile ? 1.4 : 1.8,
                };

                target = {
                  x: lerp(circlePos.x, arcPos.x, morphValue),
                  y: lerp(circlePos.y, arcPos.y, morphValue),
                  rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                  scale: lerp(1, arcPos.scale, morphValue),
                  opacity: 1,
                };
              }

              return <FlipCard key={src} src={src} target={target} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
