import { cn } from "@/lib/utils"

/** Neutral pulsing placeholder used while data loads. */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-secondary", className)}
    />
  )
}

export { Skeleton }
