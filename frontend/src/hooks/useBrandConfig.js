import { useEffect, useState } from 'react'
import api from '../utils/api.js'

// Lightweight in-memory cache to avoid refetching per session
let cached = null
let inFlight = null

/**
 * useBrandConfig
 * - Fetches BrandConfig from the backend and caches it in-memory.
 * - Returns { brandConfig, isLoading }.
 */
export default function useBrandConfig() {
  const [brandConfig, setBrandConfig] = useState(cached)
  const [isLoading, setIsLoading] = useState(!cached)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setIsLoading(true)
        const req = inFlight || api.get('/brand-config')
        inFlight = req
        const r = await req
        if (cancelled) return
        cached = r?.data || null
        setBrandConfig(cached)
      } catch (_) {
        if (!cancelled) setBrandConfig(null)
      } finally {
        if (!cancelled) setIsLoading(false)
        inFlight = null
      }
    }
    if (!cached) load()
    return () => { cancelled = true }
  }, [])

  return { brandConfig, isLoading }
}

