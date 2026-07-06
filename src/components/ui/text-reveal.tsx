import * as React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"

import { cn } from "@/lib/utils"

type TextRevealMode = "letters" | "words" | "line"
type TextRevealTag = "span" | "p" | "h2"

interface TextRevealProps {
  text: string
  className?: string
  mode?: TextRevealMode
  as?: TextRevealTag
  delay?: number
  stagger?: number
  amount?: number
}

function getTag(as: TextRevealTag, reduceMotion: boolean) {
  if (reduceMotion) {
    if (as === "p") return "p"
    if (as === "h2") return "h2"
    return "span"
  }

  if (as === "p") return motion.p
  if (as === "h2") return motion.h2
  return motion.span
}

function TextReveal({
  text,
  className,
  mode = "words",
  as = "span",
  delay = 0,
  stagger = 0.035,
  amount = 0.65,
}: TextRevealProps) {
  const reduceMotion = useReducedMotion()
  const Component = getTag(as, Boolean(reduceMotion))

  if (reduceMotion) {
    return <Component className={className}>{text}</Component>
  }

  if (mode === "line") {
    return (
      <Component
        className={className}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount }}
        transition={{ duration: 0.38, ease: "easeOut", delay }}
      >
        {text}
      </Component>
    )
  }

  const parts = mode === "letters" ? Array.from(text) : text.split(" ")
  const groupVariants: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
  }
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.34, ease: "easeOut" },
    },
  }

  return (
    <Component
      aria-label={text}
      className={cn(mode === "words" && "inline-block", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={groupVariants}
    >
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          <motion.span
            aria-hidden="true"
            className="inline-block"
            variants={itemVariants}
          >
            {part}
          </motion.span>
          {mode === "words" && index < parts.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Component>
  )
}

export { TextReveal }
