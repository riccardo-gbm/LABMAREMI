import * as React from "react"
import { m, useReducedMotion, type Variants } from "framer-motion"

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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.34, ease: "easeOut" },
  },
}

function getTag(as: TextRevealTag, reduceMotion: boolean) {
  if (reduceMotion) {
    if (as === "p") return "p"
    if (as === "h2") return "h2"
    return "span"
  }

  if (as === "p") return m.p
  if (as === "h2") return m.h2
  return m.span
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

  // Key each part by its character offset in `text` — a stable identity even
  // when the same word or letter appears more than once.
  let offset = 0
  const parts = (mode === "letters" ? Array.from(text) : text.split(" ")).map(
    (part) => {
      const item = { part, id: `${offset}-${part}` }
      offset += part.length + (mode === "words" ? 1 : 0)
      return item
    }
  )
  // Stays in-component: references the `delay`/`stagger` props, so it is not
  // a module-scope-static value.
  const groupVariants: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
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
      {parts.map((item, index) => (
        <React.Fragment key={item.id}>
          <m.span
            aria-hidden="true"
            className="inline-block"
            variants={itemVariants}
          >
            {item.part}
          </m.span>
          {mode === "words" && index < parts.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Component>
  )
}

export { TextReveal }
