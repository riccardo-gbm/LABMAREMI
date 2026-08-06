import { useEffect, useRef, useState } from "react"
import { ExternalLink, MapPin } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LazyMapFrameProps {
  src: string
  title: string
  className?: string
  heightClassName?: string
}

const GOOGLE_MAPS_DIRECT_URL =
  "https://maps.google.com/?q=-0.1280261,-78.4731768"

export function LazyMapFrame({
  src,
  title,
  className,
  heightClassName = "h-[320px] md:h-[420px]",
}: LazyMapFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoadIframe, setShouldLoadIframe] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Pre-mount map iframe when within 250px of the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadIframe(true)
          observer.disconnect()
        }
      },
      { rootMargin: "250px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-muted/30",
        heightClassName,
        className
      )}
    >
      {/* Skeleton Shimmer until iframe finishes loading */}
      {!iframeLoaded && (
        <div className="absolute inset-0 z-0 flex flex-col justify-between p-6">
          <Skeleton className="h-full w-full rounded-xl" />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
              <MapPin className="h-6 w-6" />
            </div>
            <p className="mt-3 font-display text-base font-semibold text-foreground">
              Ubicación de LABMAREMI
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Quito, Ecuador • Cobertura Pichincha
            </p>
          </div>
        </div>
      )}

      {/* Deferred Google Maps Iframe */}
      {shouldLoadIframe && (
        <iframe
          title={title}
          src={src}
          loading="lazy"
          onLoad={() => setIframeLoaded(true)}
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          className={cn(
            "h-full w-full border-0 transition-opacity duration-500",
            iframeLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* External Map Fallback Button */}
      <a
        href={GOOGLE_MAPS_DIRECT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-lg border border-background/80 bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>Ver en Google Maps</span>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
      </a>
    </div>
  )
}
