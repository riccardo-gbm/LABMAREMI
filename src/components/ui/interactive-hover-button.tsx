import * as React from "react"
import { Link, type LinkProps } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

type InteractiveHoverVariant = "default" | "secondary" | "outline" | "inverse"
type InteractiveHoverSize = "default" | "sm" | "lg"

// Hover fill is the opposite palette pole from the resting color so the
// expanding-dot animation stays visible on light and dark sections alike.
const variantClasses: Record<
  InteractiveHoverVariant,
  { root: string; overlay: string; fill: string }
> = {
  default: {
    root: "border border-transparent bg-primary text-primary-foreground shadow-sm",
    overlay: "text-primary",
    fill: "bg-primary-foreground",
  },
  secondary: {
    root: "border border-transparent bg-secondary text-secondary-foreground",
    overlay: "text-primary",
    fill: "bg-background",
  },
  outline: {
    root: "border border-input bg-background text-foreground shadow-sm",
    overlay: "text-primary-foreground",
    fill: "bg-primary",
  },
  inverse: {
    root: "border border-primary-foreground/30 bg-transparent text-primary-foreground",
    overlay: "text-primary",
    fill: "bg-background",
  },
}

const sizeClasses: Record<InteractiveHoverSize, string> = {
  default: "h-9 px-5 text-sm",
  sm: "h-8 px-4 text-xs",
  lg: "h-10 px-7 text-sm",
}

// Rest position that centers the dot between the button's left edge and the
// label's start (padding-left + the label's own translate-x-1). Must be
// overridden via `dotClassName` when a call site replaces the padding.
const dotOffsetClasses: Record<InteractiveHoverSize, string> = {
  default: "left-2",
  sm: "left-1.5",
  lg: "left-3",
}

interface InteractiveHoverStyleProps {
  text?: string
  icon?: React.ReactNode
  variant?: InteractiveHoverVariant
  size?: InteractiveHoverSize
  /** Override the fill dot's rest position; needed when className replaces the size's padding. */
  dotClassName?: string
}

function rootClasses(
  variant: InteractiveHoverVariant,
  size: InteractiveHoverSize,
  className?: string
) {
  return cn(
    "group relative inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full text-center font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant].root,
    sizeClasses[size],
    className
  )
}

function InteractiveHoverInner({
  text,
  icon,
  variant,
  size,
  dotClassName,
}: {
  text: string
  icon: React.ReactNode
  variant: InteractiveHoverVariant
  size: InteractiveHoverSize
  dotClassName?: string
}) {
  const styles = variantClasses[variant]
  return (
    <>
      <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0 motion-reduce:transition-none">
        {text}
      </span>
      <div
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0",
          styles.overlay
        )}
      >
        <span>{text}</span>
        {icon}
      </div>
      <div
        className={cn(
          "absolute top-[40%] h-2 w-2 scale-[1] rounded-lg transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] motion-reduce:transition-none",
          dotOffsetClasses[size],
          dotClassName,
          styles.fill
        )}
      />
    </>
  )
}

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    InteractiveHoverStyleProps {}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(
  (
    {
      text = "Botón",
      icon = <ArrowRight aria-hidden="true" />,
      variant = "default",
      size = "default",
      dotClassName,
      className,
      ...props
    },
    ref
  ) => (
    <button ref={ref} className={rootClasses(variant, size, className)} {...props}>
      <InteractiveHoverInner
        text={text}
        icon={icon}
        variant={variant}
        size={size}
        dotClassName={dotClassName}
      />
    </button>
  )
)
InteractiveHoverButton.displayName = "InteractiveHoverButton"

interface InteractiveHoverLinkProps
  extends LinkProps,
    InteractiveHoverStyleProps {}

const InteractiveHoverLink = React.forwardRef<
  HTMLAnchorElement,
  InteractiveHoverLinkProps
>(
  (
    {
      text = "Botón",
      icon = <ArrowRight aria-hidden="true" />,
      variant = "default",
      size = "default",
      dotClassName,
      className,
      ...props
    },
    ref
  ) => (
    <Link ref={ref} className={rootClasses(variant, size, className)} {...props}>
      <InteractiveHoverInner
        text={text}
        icon={icon}
        variant={variant}
        size={size}
        dotClassName={dotClassName}
      />
    </Link>
  )
)
InteractiveHoverLink.displayName = "InteractiveHoverLink"

interface InteractiveHoverAnchorProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    InteractiveHoverStyleProps {}

const InteractiveHoverAnchor = React.forwardRef<
  HTMLAnchorElement,
  InteractiveHoverAnchorProps
>(
  (
    {
      text = "Botón",
      icon = <ArrowRight aria-hidden="true" />,
      variant = "default",
      size = "default",
      dotClassName,
      className,
      ...props
    },
    ref
  ) => (
    <a ref={ref} className={rootClasses(variant, size, className)} {...props}>
      <InteractiveHoverInner
        text={text}
        icon={icon}
        variant={variant}
        size={size}
        dotClassName={dotClassName}
      />
    </a>
  )
)
InteractiveHoverAnchor.displayName = "InteractiveHoverAnchor"

export {
  InteractiveHoverButton,
  InteractiveHoverLink,
  InteractiveHoverAnchor,
}
