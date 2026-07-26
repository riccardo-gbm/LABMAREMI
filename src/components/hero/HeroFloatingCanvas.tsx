import { useEffect, useState, useMemo, useRef } from "react";
import {
  m,
  motionValue,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";

const TWO_PI = Math.PI;

/**
 * Supplier brand logos for the lines LABMAREMI distributes, drifting around the
 * wordmark. Decorative only — the whole canvas is aria-hidden in the hero, so
 * every img carries an empty alt.
 *
 * Assets are WebP at 240px, generated from the originals in design-assets/ by
 * scripts/optimize-images.mjs. They used to be base64-encoded PNGs wrapped in
 * SVG totalling 9.2 MB (one was 5.2 MB for a 110px slot), which is what pushed
 * mobile LCP to 3.94s. Do not add art here without checking its byte size —
 * scripts/check-asset-budget.mjs enforces the ceiling.
 *
 * Even indices render on every viewport; odd indices are hidden below `sm` so
 * mobile carries six logos instead of twelve, evenly spread around the ring.
 */
const images = [
  { src: "/photo1.webp", brand: "Krik", size: "w-[70px] h-[70px] sm:w-[85px] sm:h-[85px] md:w-[105px] md:h-[105px]", rotate: -4 },
  { src: "/photo2.webp", brand: "Familia", size: "w-[80px] h-[80px] sm:w-[95px] sm:h-[95px] md:w-[120px] md:h-[120px]", rotate: 5 },
  { src: "/photo3.webp", brand: "Tork", size: "w-[70px] h-[70px] sm:w-[85px] sm:h-[85px] md:w-[100px] md:h-[100px]", rotate: -5 },
  { src: "/photo4.webp", brand: "Scott", size: "w-[75px] h-[75px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px]", rotate: 4 },
  { src: "/photo5.webp", brand: "Master", size: "w-[70px] h-[70px] sm:w-[85px] sm:h-[85px] md:w-[105px] md:h-[105px]", rotate: 3 },
  { src: "/photo6.webp", brand: "ISO", size: "w-[75px] h-[75px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px]", rotate: -3 },
  { src: "/photo7.webp", brand: "Microlimpia", size: "w-[75px] h-[75px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px]", rotate: 6 },
  { src: "/photo8.webp", brand: "Tips", size: "w-[70px] h-[70px] sm:w-[85px] sm:h-[85px] md:w-[105px] md:h-[105px]", rotate: -6 },
  { src: "/photo9.webp", brand: "Lava", size: "w-[75px] h-[75px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px]", rotate: 4 },
  { src: "/photo10.webp", brand: "3M", size: "w-[70px] h-[70px] sm:w-[85px] sm:h-[85px] md:w-[105px] md:h-[105px]", rotate: 2 },
  { src: "/photo11.webp", brand: "Estrella", size: "w-[75px] h-[75px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px]", rotate: -3 },
  { src: "/photo12.webp", brand: "WypAll", size: "w-[80px] h-[80px] sm:w-[95px] sm:h-[95px] md:w-[115px] md:h-[115px]", rotate: 5 },
];

/** Per-cloud drift parameters, derived once from the index. */
function driftParams(index: number, ampScale: number) {
  return {
    ampX1: (9 + (index % 3) * 3) * ampScale,
    ampX2: (4 + (index % 2) * 2) * ampScale,
    ampY1: (10 + ((index + 1) % 3) * 3.5) * ampScale,
    ampY2: 5 * ampScale,
    periodX1: 10 + (index % 4) * 1.5,
    periodX2: 6 + (index % 3),
    periodY1: 9 + ((index * 2) % 5),
    periodY2: 5.5 + (index % 2) * 1.5,
    periodRot: 11 + (index % 3),
    phase1: index * 1.7,
    phase2: index * 2.3,
    phase3: index * 2.9,
    phase4: index * 1.3,
    // Cursor-follow depth: 5-12.5px max offset, so the parallax stays subtle.
    depth: 5 + (index % 4) * 2.5,
  };
}

interface Cloud {
  img: (typeof images)[number];
  index: number;
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotate: MotionValue<number>;
  params: ReturnType<typeof driftParams>;
}

function FloatingCloud({
  cloud,
  position,
  hideOnMobile,
}: {
  cloud: Cloud;
  position: { left: string; top: string };
  hideOnMobile: boolean;
}) {
  const { img, x, y, rotate } = cloud;
  return (
    <m.div
      className={`absolute ${img.size} ${hideOnMobile ? "hidden sm:block" : ""}`}
      style={{ ...position, x, y, z: 0, rotate }}
    >
      {/* Above the fold: no loading="lazy". Lazy images are invisible to the
          preload scanner and are only requested after layout, which delays the
          very paint this hero is measured on. */}
      <img
        src={img.src}
        alt=""
        width={240}
        height={240}
        decoding="async"
        fetchPriority={cloud.index < 4 ? "high" : "auto"}
        className="w-full h-full object-contain pointer-events-none"
        style={{ WebkitTransform: "translateZ(0)" }}
        draggable={false}
      />
    </m.div>
  );
}

export default function HeroFloatingCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 1200,
          height: entry.contentRect.height || 600,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Freeze all per-frame work (blobs + floating clouds) while the hero is
  // scrolled out of view.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isMobileScreen = dimensions.width > 0 && dimensions.width < 640;

  // Motion values are created outside the render tree (motionValue(), not
  // useMotionValue) so a single parent rAF loop can drive all of them. Twelve
  // components each running their own useAnimationFrame meant 36 motion-value
  // writes per frame across twelve callbacks — a measurable share of the 192ms
  // input delay this hero was posting on mobile.
  const clouds = useMemo<Cloud[]>(() => {
    const ampScale = isMobileScreen ? 0.35 : 1.0;
    return images.map((img, index) => ({
      img,
      index,
      x: motionValue(0),
      y: motionValue(0),
      rotate: motionValue(img.rotate),
      params: driftParams(index, ampScale),
    }));
  }, [isMobileScreen]);

  // Mobile shows even indices only, so positions are laid out over the visible
  // count — otherwise the culled ring would have six gaps in it.
  const positions = useMemo(() => {
    const isMobile = dimensions.width < 640;
    const K = dimensions.height > 0 ? dimensions.width / dimensions.height : 2.0;

    // Expand horizontal radius on mobile to maximize central space without
    // heavy cropping at the screen edges.
    const rx = isMobile ? 40 : 35;
    const ry = isMobile ? 35 : 30;

    // Scale horizontal radius by the aspect ratio for arc-length integration in pixel space
    const rxEff = rx * K;
    const ryEff = ry;

    // 360 degrees on mobile, top arch (40 to -220 deg) on desktop
    const thetaStart = isMobile ? 0 : (40 * Math.PI) / 180;
    const thetaEnd = isMobile ? 2 * Math.PI : (-220 * Math.PI) / 180;

    // Numerical integration of arc length on the scaled ellipse
    const N = 300;
    const step = (thetaEnd - thetaStart) / N;
    const arcLengths = [0];
    let totalLength = 0;

    const f = (t: number) => {
      const s = Math.sin(t);
      const c = Math.cos(t);
      return Math.sqrt(rxEff * rxEff * s * s + ryEff * ryEff * c * c);
    };

    for (let i = 0; i < N; i++) {
      const t = thetaStart + i * step;
      totalLength += Math.abs(f(t) * step);
      arcLengths.push(totalLength);
    }

    // Index within the set that is actually visible at this breakpoint.
    const slotOf = (i: number) => (isMobile ? i / 2 : i);
    const visibleCount = isMobile ? Math.ceil(images.length / 2) : images.length;
    // A closed ring needs N equal segments so the last slot doesn't overlap the first.
    const numSegments = isMobile ? visibleCount : visibleCount - 1;

    const positionsArray = [];
    for (let i = 0; i < images.length; i++) {
      // Odd indices are hidden on mobile; park them on their neighbour's slot.
      const slot = isMobile ? Math.floor(slotOf(i)) : i;
      const targetLen = slot * (totalLength / numSegments);

      // Binary search for the theta that corresponds to targetLen
      let low = 0;
      let high = N;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (arcLengths[mid] < targetLen) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      const theta = thetaStart + low * step;

      const leftPercent = 50 + rx * Math.cos(theta);
      const topPercent = 44 + ry * Math.sin(theta);

      // Offset by half the average logo size to center it on its coordinate
      const offset = isMobile ? 38 : 50;

      positionsArray.push({
        left: `calc(${leftPercent}% - ${offset}px)`,
        top: `calc(${topPercent}% - ${offset}px)`,
      });
    }

    return positionsArray;
  }, [dimensions]);

  const reduceMotion = useReducedMotion();
  // Disable heavy blur animations on mobile to prevent GPU performance drops
  const blobsAnimate = !reduceMotion && inView && !isMobileScreen;

  // Cursor-follow parallax: normalized viewport position smoothed by a soft
  // spring, applied per cloud inside the shared animation frame.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(mouseX, { stiffness: 40, damping: 25, mass: 1.2 });
  const parallaxY = useSpring(mouseY, { stiffness: 40, damping: 25, mass: 1.2 });

  useEffect(() => {
    if (reduceMotion) return;
    // Pointer parallax is a no-op on touch devices — skip the listener there so
    // mobile never pays for scroll-adjacent pointer events.
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) return;
    const handleMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY, reduceMotion]);

  // One loop for every cloud, instead of one loop per cloud.
  const staticOnly = (reduceMotion ?? false) || !inView;
  useAnimationFrame((time) => {
    if (staticOnly) return;
    const t = time / 1000;
    const px = parallaxX.get();
    const py = parallaxY.get();

    for (const cloud of clouds) {
      // Skip the culled half on mobile — hidden elements still cost a write.
      if (isMobileScreen && cloud.index % 2 === 1) continue;
      const p = cloud.params;
      const floatX =
        Math.sin((t / p.periodX1) * TWO_PI + p.phase1) * p.ampX1 +
        Math.cos((t / p.periodX2) * TWO_PI + p.phase2) * p.ampX2;
      const floatY =
        Math.cos((t / p.periodY1) * TWO_PI + p.phase3) * p.ampY1 +
        Math.sin((t / p.periodY2) * TWO_PI + p.phase4) * p.ampY2;
      cloud.x.set(floatX + px * p.depth);
      cloud.y.set(floatY + py * p.depth);
      cloud.rotate.set(
        cloud.img.rotate + Math.sin((t / p.periodRot) * TWO_PI + cloud.index) * 2.5
      );
    }
  });

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {/* Cyan/white diffusion background. Translate-only drift (no scale/rotate)
          so the browser can cache each blurred bitmap and just move it, instead
          of re-rasterizing a huge blur every frame. */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <m.div
          animate={blobsAnimate ? { x: [0, 50, -40, 20, 0], y: [0, -40, 50, -20, 0] } : undefined}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-cyan-200 rounded-full blur-[70px] opacity-50"
        />
        <m.div
          animate={blobsAnimate ? { x: [0, -60, 40, -30, 0], y: [0, 50, -40, 20, 0] } : undefined}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] -right-[15%] w-[60%] h-[60%] bg-sky-100 rounded-full blur-[70px] opacity-60"
        />
        <m.div
          animate={blobsAnimate ? { x: [0, 40, -50, 30, 0], y: [0, -50, 40, -10, 0] } : undefined}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] left-[10%] w-[55%] h-[55%] bg-white rounded-full blur-[70px] opacity-70"
        />
      </div>

      {/* Radial clearing for the centered text panel */}
      <div
        className="absolute inset-0 z-[15] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 45%, transparent 70%)",
        }}
      />

      {/* Floating brand imagery */}
      <div className="absolute inset-0 z-20">
        {clouds.map((cloud) => (
          <FloatingCloud
            key={cloud.img.src}
            cloud={cloud}
            hideOnMobile={cloud.index % 2 === 1}
            position={positions[cloud.index] || { left: "0%", top: "0%" }}
          />
        ))}
      </div>
    </div>
  );
}
