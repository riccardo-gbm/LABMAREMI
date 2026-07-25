import { useCallback, useEffect, useRef, useState } from "react"

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: boolean
  /** Re-runs the fetch. Safe to pass straight to a retry button. */
  retry: () => void
}

/**
 * How long a fetch may hang before we give up and show the retry card.
 *
 * Without this the skeleton can sit for 15s+ on a dead connection: supabase-js
 * resolves the auth session before each query and retries that internally, so
 * a network failure surfaces far later than the request that caused it. Five
 * seconds is comfortably above a normal cold catalog fetch (~40 KB) while
 * still failing fast enough that the page never looks hung.
 */
const DEFAULT_TIMEOUT_MS = 5000

/**
 * Minimal fetch-on-mount hook shared by every page that reads Supabase, so
 * loading / error / retry behave identically across the site instead of each
 * page hand-rolling its own useEffect + try/catch.
 *
 * `fetcher` must be stable (useCallback or a module-level function) — it is
 * the effect's dependency.
 */
export function useAsync<T>(
  fetcher: () => Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  // Guards against a resolved promise writing state after unmount, and against
  // a slow first request overwriting a newer retry.
  const runId = useRef(0)

  useEffect(() => {
    const id = ++runId.current
    let active = true
    // Once a run has produced an outcome — data, failure, or timeout — nothing
    // else may write for it. Without this a request that finally lands after
    // the timeout would swap the retry card out for content on its own.
    let settled = false

    setLoading(true)
    setError(false)

    // First outcome to arrive wins; the rest are ignored. `claim` returns
    // whether this call gets to be that outcome.
    const claim = () => {
      if (!active || settled || id !== runId.current) return false
      settled = true
      return true
    }
    const succeed = (result: T) => {
      if (!claim()) return
      setData(result)
      setLoading(false)
    }
    const fail = () => {
      if (!claim()) return
      setError(true)
      setLoading(false)
    }

    const timer = setTimeout(fail, timeoutMs)

    fetcher()
      .then(succeed)
      .catch(fail)
      .finally(() => clearTimeout(timer))

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [fetcher, attempt, timeoutMs])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { data, loading, error, retry }
}
