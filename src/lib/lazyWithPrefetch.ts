import { lazy, type ComponentType, type LazyExoticComponent } from "react"

type Prefetchable<T extends ComponentType<unknown>> = LazyExoticComponent<T> & {
  prefetch: () => void
}

/**
 * React.lazy whose chunk can be warmed ahead of render (nav hover/focus/touch,
 * idle time). The factory result is memoized so prefetch and render share one
 * request; a failed prefetch clears the cache so the real render retries
 * instead of rejecting forever on a transient network error.
 */
export function lazyWithPrefetch<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): Prefetchable<T> {
  let promise: Promise<{ default: T }> | undefined
  const load = () => {
    promise ??= factory().catch((err: unknown) => {
      promise = undefined
      throw err
    })
    return promise
  }
  const component = lazy(load) as Prefetchable<T>
  component.prefetch = () => {
    load().catch(() => {
      // Swallow: prefetch is best-effort; the render path retries via load().
    })
  }
  return component
}
