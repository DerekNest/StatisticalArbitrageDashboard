import { useState, useEffect, useCallback } from 'react'

const BASE = 'http://localhost:8000'

async function fetchJSON(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export function useApi(path, refreshInterval = null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const result = await fetchJSON(path)
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    load()
    if (refreshInterval) {
      const id = setInterval(load, refreshInterval)
      return () => clearInterval(id)
    }
  }, [load, refreshInterval])

  return { data, loading, error, refresh: load }
}
