import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface MediaFrameProps {
  src?: string
  alt?: string
  fallbackLabel: string
  fallbackIcon?: LucideIcon
  className?: string
  imageClassName?: string
  badge?: string
}

function MediaFrame({
  src,
  alt,
  fallbackLabel,
  fallbackIcon: FallbackIcon,
  className,
  imageClassName,
  badge,
}: MediaFrameProps) {
  return (
    <div
      className={cn(
        "group/media relative overflow-hidden rounded-lg border border-primary/10 bg-gradient-to-br from-secondary via-background to-accent/50",
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? fallbackLabel}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 ease-out group-hover/media:scale-[1.03]",
            imageClassName
          )}
        />
      ) : (
        <div className="flex h-full min-h-[180px] w-full flex-col items-center justify-center gap-3 p-6 text-center">
          {FallbackIcon ? (
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <FallbackIcon className="h-7 w-7" aria-hidden="true" />
            </span>
          ) : null}
          <span className="max-w-[14rem] text-sm font-medium text-muted-foreground">
            {fallbackLabel}
          </span>
        </div>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),transparent_38%,rgba(34,211,238,0.12))]"
      />

      {badge ? (
        <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur-md">
          {badge}
        </span>
      ) : null}
    </div>
  )
}

export { MediaFrame }
