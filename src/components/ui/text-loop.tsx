import {
  AnimatePresence,
  type AnimatePresenceProps,
  m,
  type Transition,
  type Variants,
} from "framer-motion";
import { Children, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  trigger?: boolean;
  mode?: AnimatePresenceProps["mode"];
};

const defaultVariants: Variants = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  initial: { opacity: 0, y: 20 },
};

export function TextLoop({
  children,
  className,
  interval = 2,
  transition = { duration: 0.3 },
  variants,
  onIndexChange,
  trigger = true,
  mode = "popLayout",
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!trigger) return;
    const timer = setInterval(() => {
      // Compute the next index purely, then update state and notify — both
      // outside the state updater, which React may replay.
      const next = (indexRef.current + 1) % items.length;
      indexRef.current = next;
      setCurrentIndex(next);
      onIndexChange?.(next);
    }, interval * 1000);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, trigger]);

  return (
    <div className={cn("relative inline-block whitespace-nowrap", className)}>
      <AnimatePresence initial={false} mode={mode}>
        <m.div
          animate="animate"
          exit="exit"
          initial="initial"
          key={currentIndex}
          transition={transition}
          variants={variants ?? defaultVariants}
        >
          {items[currentIndex]}
        </m.div>
      </AnimatePresence>
    </div>
  );
}

export default TextLoop;
