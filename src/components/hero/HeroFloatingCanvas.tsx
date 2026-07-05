import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Verified Unsplash stock photos (cleaning/protection subjects), sized small via
// "?q=80&w=500". Swap in real LABMAREMI product photos later; the component
// doesn't need to change, just this array. Images past index 3 are hidden on
// mobile (less room when the hero stacks).
const images = [
  // Blue nitrile gloves forming a heart
  { src: "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=500", shape: "rounded-full", size: "w-[130px] h-[130px] md:w-[180px] md:h-[180px]", rotate: -4, duration: 3.6 },
  // Amber "kitchen/bathroom cleaner" spray bottles with brush
  { src: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=500", shape: "rounded-[40%_60%_60%_40%/60%_30%_70%_40%]", size: "w-[150px] h-[180px] md:w-[200px] md:h-[240px]", rotate: 5, duration: 4.1 },
  // Rubber glove holding a yellow spray bottle
  { src: "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=500", shape: "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]", size: "w-[130px] h-[130px] md:w-[170px] md:h-[170px]", rotate: -5, duration: 3.9 },
  // Gloved hands disinfecting a surface with spray + paper towel
  { src: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?q=80&w=500", shape: "rounded-[40px]", size: "w-[150px] h-[120px] md:w-[210px] md:h-[170px]", rotate: 4, duration: 4.3 },
  // Putting on blue nitrile gloves
  { src: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=500", shape: "rounded-full", size: "w-[120px] h-[150px] md:w-[160px] md:h-[200px]", rotate: 3, duration: 3.7 },
  // Natural cleaner spray bottle with lemons
  { src: "https://images.unsplash.com/photo-1583907659441-addbe699e921?q=80&w=500", shape: "rounded-[40%_60%_50%_50%/50%_50%_50%_50%]", size: "w-[140px] h-[140px] md:w-[190px] md:h-[190px]", rotate: -3, duration: 4.4 },
  // Hand sanitizer bottle with face mask
  { src: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?q=80&w=500", shape: "rounded-[50px]", size: "w-[120px] h-[160px] md:w-[160px] md:h-[210px]", rotate: 6, duration: 3.4 },
  // Worker with mask, goggles and gloves cleaning window shutters
  { src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=500", shape: "rounded-[60%_40%_40%_60%/50%_60%_40%_50%]", size: "w-[140px] h-[120px] md:w-[200px] md:h-[160px]", rotate: -6, duration: 4.0 },
  // Blue glass-cleaner spray bottle with paper towel roll
  { src: "https://images.unsplash.com/photo-1550963295-019d8a8a61c5?q=80&w=500", shape: "rounded-[45px]", size: "w-[120px] h-[150px] md:w-[170px] md:h-[220px]", rotate: 4, duration: 3.8 },
];

export default function HeroFloatingCanvas() {
  const [mounted, setMounted] = useState(false);
  const [positions, setPositions] = useState(images.map(() => ({ top: "0%", left: "0%" })));
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200, mass: 0.6 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200, mass: 0.6 });
  const translateX = useTransform(smoothX, [-1, 1], [-30, 30]);
  const translateY = useTransform(smoothY, [-1, 1], [-30, 30]);
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    setMounted(true);
    const cols = 4, rows = 3;
    const cells = Array.from({ length: cols * rows }, (_, i) => i).sort(() => Math.random() - 0.5);
    setPositions(images.map((_, i) => {
      const cell = cells[i];
      const row = Math.floor(cell / cols), col = cell % cols;
      const cw = 100 / cols, ch = 100 / rows;
      return {
        left: `${random(col * cw + 3, (col + 1) * cw - 15)}%`,
        top: `${random(row * ch + 3, (row + 1) * ch - 15)}%`,
      };
    }));
    if (prefersReducedMotion) return;
    const handleMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY, prefersReducedMotion]);

  if (!mounted) return null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Cyan/white diffusion background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={prefersReducedMotion ? {} : { scale: [1, 1.15, 1], rotate: [0, 60, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-cyan-200 rounded-full blur-[100px] opacity-50"
        />
        <motion.div
          animate={prefersReducedMotion ? {} : { scale: [1.1, 0.95, 1.1], rotate: [0, -50, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[15%] w-[60%] h-[60%] bg-sky-100 rounded-full blur-[100px] opacity-60"
        />
        <motion.div
          animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], rotate: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
      <motion.div className="absolute inset-0 z-10" style={{ x: translateX, y: translateY }}>
        {images.map((img, i) => (
          <motion.div
            key={i}
            className={`absolute overflow-hidden border border-white/60 bg-white/40 backdrop-blur-sm shadow-[0_15px_40px_rgba(0,0,0,0.08)] ${img.shape} ${img.size} ${i >= 4 ? "hidden md:block" : ""}`}
            style={positions[i]}
            initial={{ rotate: img.rotate }}
            animate={prefersReducedMotion ? {} : { y: [0, -20, 0], rotate: [img.rotate, img.rotate + 3, img.rotate] }}
            transition={{ duration: img.duration, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
          >
            <img src={img.src} alt="" loading="lazy" className="w-full h-full object-cover" draggable={false} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
