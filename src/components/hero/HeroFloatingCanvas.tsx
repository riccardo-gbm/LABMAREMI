import { useEffect } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const TWO_PI = Math.PI * 2;

// Exactly 9 clouds around the wordmark: the 5 local product illustrations plus
// 4 verified Unsplash stock photos (cleaning/protection subjects) sized small
// via "?q=80&w=500". Swap in real LABMAREMI product photos later; only this
// array needs to change. Odd indices are hidden on mobile so the 5 that remain
// stay evenly spread around the ring.
const images = [
  // Blue nitrile gloves forming a heart
  { src: "/photo1.svg", shape: "rounded-full", size: "w-[75px] h-[75px] md:w-[105px] md:h-[105px]", rotate: -4 },
  // Amber "kitchen/bathroom cleaner" spray bottles with brush
  { src: "/photo2.svg", shape: "rounded-[40%_60%_60%_40%/60%_30%_70%_40%]", size: "w-[85px] h-[105px] md:w-[115px] md:h-[140px]", rotate: 5 },
  // Rubber glove holding a yellow spray bottle
  { src: "/photo3.svg", shape: "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]", size: "w-[75px] h-[75px] md:w-[100px] md:h-[100px]", rotate: -5 },
  // Gloved hands disinfecting a surface with spray + paper towel
  { src: "/photo4.svg", shape: "rounded-[40px]", size: "w-[85px] h-[70px] md:w-[120px] md:h-[100px]", rotate: 4 },
  // Putting on blue nitrile gloves
  { src: "/photo5.svg", shape: "rounded-full", size: "w-[70px] h-[85px] md:w-[95px] md:h-[115px]", rotate: 3 },
  // Natural cleaner spray bottle with lemons
  { src: "https://images.unsplash.com/photo-1583907659441-addbe699e921?q=80&w=500", shape: "rounded-[40%_60%_50%_50%/50%_50%_50%_50%]", size: "w-[80px] h-[80px] md:w-[110px] md:h-[110px]", rotate: -3 },
  // Hand sanitizer bottle with face mask
  { src: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?q=80&w=500", shape: "rounded-[50px]", size: "w-[70px] h-[90px] md:w-[95px] md:h-[120px]", rotate: 6 },
  // Worker with mask, goggles and gloves cleaning window shutters
  { src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=500", shape: "rounded-[60%_40%_40%_60%/50%_60%_40%_50%]", size: "w-[80px] h-[70px] md:w-[115px] md:h-[95px]", rotate: -6 },
  // Blue glass-cleaner spray bottle with paper towel roll
  { src: "https://images.unsplash.com/photo-1550963295-019d8a8a61c5?q=80&w=500", shape: "rounded-[45px]", size: "w-[70px] h-[85px] md:w-[100px] md:h-[125px]", rotate: 4 },
];

// Deterministic ring positions, computed once at module load — the layout is
// identical on every visit/refresh (no Math.random). The 9 clouds sit on an
// ellipse that fully surrounds the wordmark, alternating inner/outer radii so
// ring neighbors never crowd each other.
const positions = images.map((_, i) => {
  const wobble = ((i % 3) - 1) * 0.06; // fixed organic offset, not random
  const theta = (-90 + i * 40) * (Math.PI / 180) + wobble; // start at the top, step 40°
  const outer = i % 2 === 0; // alternate rings; mobile keeps only the outer ones
  const rx = outer ? 41 : 33; // horizontal radius, % of container
  const ry = outer ? 30 : 23; // vertical radius
  // Ellipse centered at (50%, 44%); -4 ≈ half a cloud's footprint in %. Top is
  // clamped so no cloud drifts under the CTAs or the bottom glass boxes.
  const left = clamp(50 + rx * Math.cos(theta) - 4, 3, 88);
  const top = clamp(44 + ry * Math.sin(theta) - 4, 4, 64);
  return { left: `${left}%`, top: `${top}%` };
});

interface FloatingCloudProps {
  img: (typeof images)[number];
  index: number;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
  staticOnly: boolean;
}

function FloatingCloud({ img, index, parallaxX, parallaxY, staticOnly }: FloatingCloudProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(img.rotate);

  // Per-cloud deterministic drift parameters: two layered sine waves per axis
  // with index-derived periods/phases give each cloud its own continuous,
  // never-reversing wander (no keyframe ping-pong).
  const ampX1 = 9 + (index % 3) * 3;
  const ampX2 = 4 + (index % 2) * 2;
  const ampY1 = 10 + ((index + 1) % 3) * 3.5;
  const ampY2 = 5;
  const periodX1 = 10 + (index % 4) * 1.5;
  const periodX2 = 6 + (index % 3);
  const periodY1 = 9 + ((index * 2) % 5);
  const periodY2 = 5.5 + (index % 2) * 1.5;
  const periodRot = 11 + (index % 3);
  const phase1 = index * 1.7;
  const phase2 = index * 2.3;
  const phase3 = index * 2.9;
  const phase4 = index * 1.3;
  // Cursor-follow depth: 5–12.5px max offset, so the parallax stays subtle.
  const depth = 5 + (index % 4) * 2.5;

  useAnimationFrame((time) => {
    if (staticOnly) return;
    const t = time / 1000;
    const floatX =
      Math.sin((t / periodX1) * TWO_PI + phase1) * ampX1 +
      Math.cos((t / periodX2) * TWO_PI + phase2) * ampX2;
    const floatY =
      Math.cos((t / periodY1) * TWO_PI + phase3) * ampY1 +
      Math.sin((t / periodY2) * TWO_PI + phase4) * ampY2;
    x.set(floatX + parallaxX.get() * depth);
    y.set(floatY + parallaxY.get() * depth);
    rotate.set(img.rotate + Math.sin((t / periodRot) * TWO_PI + index) * 2.5);
  });

  return (
    <motion.div
      className={`absolute overflow-hidden border border-white/60 bg-white/40 shadow-[0_15px_40px_rgba(0,0,0,0.08)] ${img.shape} ${img.size} ${index % 2 === 1 ? "hidden md:block" : ""}`}
      style={{ ...positions[index], x, y, rotate }}
    >
      <img src={img.src} alt="" loading="lazy" className="w-full h-full object-cover" draggable={false} />
    </motion.div>
  );
}

export default function HeroFloatingCanvas() {
  const reduceMotion = useReducedMotion();

  // Cursor-follow parallax: normalized viewport position smoothed by a soft
  // spring, applied per cloud inside its animation frame.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(mouseX, { stiffness: 40, damping: 25, mass: 1.2 });
  const parallaxY = useSpring(mouseY, { stiffness: 40, damping: 25, mass: 1.2 });

  useEffect(() => {
    if (reduceMotion) return;
    const handleMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY, reduceMotion]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Cyan/white diffusion background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.25, 0.95, 1.2, 1], x: [0, 50, -40, 20, 0], y: [0, -40, 50, -20, 0], rotate: [0, 120, 240, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-cyan-200 rounded-full blur-[100px] opacity-50"
        />
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.2, 0.95, 1.1], x: [0, -60, 40, -30, 0], y: [0, 50, -40, 20, 0], rotate: [0, -120, -240, -360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] -right-[15%] w-[60%] h-[60%] bg-sky-100 rounded-full blur-[100px] opacity-60"
        />
        <motion.div
          animate={{ scale: [1, 1.25, 0.9, 1.15, 1], x: [0, 40, -50, 30, 0], y: [0, -50, 40, -10, 0], rotate: [0, 90, 180, 270] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] left-[10%] w-[55%] h-[55%] bg-white rounded-full blur-[90px] opacity-70"
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

      {/* Floating product imagery */}
      <div className="absolute inset-0 z-10">
        {images.map((img, i) => (
          <FloatingCloud
            key={img.src}
            img={img}
            index={i}
            parallaxX={parallaxX}
            parallaxY={parallaxY}
            staticOnly={reduceMotion ?? false}
          />
        ))}
      </div>
    </div>
  );
}
