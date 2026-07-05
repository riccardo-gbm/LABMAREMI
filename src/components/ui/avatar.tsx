import * as React from "react"

import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-10 w-10 text-xs",
  md: "h-16 w-16 text-lg",
  lg: "h-24 w-24 text-2xl",
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

/**
 * Styled placeholder for a person's photo — Phase 1 has no real team photos,
 * so this renders initials on a brand gradient instead of a broken <img>.
 * Swap in a real <img> here once photos are available; the size/shape
 * contract stays the same.
 */
function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary via-[oklch(0.55_0.2_255)] to-ring font-display font-semibold text-primary-foreground",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  )
}

export { Avatar }
