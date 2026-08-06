import { useState } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface MediaFrameProps {
  src?: string
  srcSet?: string
  sizes?: string
  alt?: string
  fallbackLabel: string
  fallbackIcon?: LucideIcon
  className?: string
  imageClassName?: string
  badge?: string
  /** Set to true for above-the-fold cards to trigger eager fetch and high priority loading. */
  priority?: boolean
}

function MediaFrameInner({
  src,
  srcSet,
  sizes,
  alt,
  fallbackLabel,
  fallbackIcon: FallbackIcon,
  className,
  imageClassName,
  badge,
  priority = false,
}: MediaFrameProps) {
  // A product with no photo yet arrives as src=undefined; a product whose
  // stored image_url 404s fails at load time. Both must land on the same
  // icon placeholder rather than a broken-image glyph.
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div
      className={cn(
        "group/media relative overflow-hidden rounded-lg border border-primary/10 bg-gradient-to-br from-secondary via-background to-accent/50",
        className
      )}
    >
      {showImage ? (
        <>
          {/* Skeleton shimmer shown while image is loading in the background */}
          {!loaded ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 animate-pulse bg-muted/50"
            />
          ) : null}
          <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt ?? fallbackLabel}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            // A catalog page change swaps in a whole grid of these at once;
            // async decode keeps that off the main thread.
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              "h-full w-full object-cover transition-all duration-300 ease-out group-hover/media:scale-[1.03]",
              loaded ? "opacity-100" : "opacity-0",
              imageClassName
            )}
          />
        </>
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

      {/* bg-white/90 instead of bg-white/80 + backdrop-blur-md: the blur cost a
          compositing layer per card — 24 on a full catalog page, all re-sampling
          while the grid scrolls — to soften a backdrop already 80% covered. The
          extra 10% opacity buys the legibility back for nothing. */}
      {badge ? (
        <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary shadow-sm">
          {badge}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Remounts on `src` change (via `key`) so the internal `failed` flag resets for
 * the new image on its own, instead of being cleared by hand in an effect —
 * which briefly showed the previous image's fallback state on swap.
 */
function MediaFrame(props: MediaFrameProps) {
  return <MediaFrameInner key={props.src ?? "__no-src__"} {...props} />
}

export { MediaFrame }
