// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useAPI.js
// Generic data-fetching hook with loading, error, and fallback states
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'

/**
 * @param {Function} fetchFn   – async function that returns data
 * @param {*}        fallback  – value returned when fetchFn throws
 * @returns {{ data, loading, error, refetch }}
 */
export function useAPI(fetchFn, fallback) {
  const [data,    setData]    = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err.message)
      setData(fallback)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, fallback])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { run() }, [run])

  return { data, loading, error, refetch: run }
}

