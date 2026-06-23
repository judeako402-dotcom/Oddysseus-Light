import { useEffect, useState, useCallback, useRef } from 'react'

const API = '/api'

async function get(path) {
  const res = await fetch(API + path)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export function usePoll(path, intervalMs = 30000) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const cancelled = useRef(false)

  const fetchOnce = useCallback(async () => {
    try {
      const d = await get(path)
      if (!cancelled.current) {
        setData(d)
        setError(null)
      }
    } catch (e) {
      if (!cancelled.current) setError(e.message)
    } finally {
      if (!cancelled.current) setLoading(false)
    }
  }, [path])

  useEffect(() => {
    cancelled.current = false
    fetchOnce()
    const id = setInterval(fetchOnce, intervalMs)
    return () => {
      cancelled.current = true
      clearInterval(id)
    }
  }, [fetchOnce, intervalMs])

  return { data, error, loading, refresh: fetchOnce }
}

export function useHealth() {
  return usePoll('/health', 10000)
}

export function useStats() {
  return usePoll('/stats', 5000)
}

export function useN8nHealth() {
  return usePoll('/health/n8n', 30000)
}

export function useModels() {
  return usePoll('/ai/models', 60000)
}
