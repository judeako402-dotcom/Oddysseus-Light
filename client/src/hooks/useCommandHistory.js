import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'odysseus:cmdhistory'
const MAX = 100

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function save(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX)))
  } catch {}
}

export function useCommandHistory() {
  const [history, setHistory] = useState(load)
  const [index, setIndex] = useState(-1)
  const [draft, setDraft] = useState('')

  const add = useCallback((cmd) => {
    if (!cmd.trim()) return
    setHistory((h) => {
      const next = [cmd, ...h.filter((x) => x !== cmd)].slice(0, MAX)
      save(next)
      return next
    })
    setIndex(-1)
    setDraft('')
  }, [])

  const up = useCallback((current) => {
    if (history.length === 0) return null
    setIndex((i) => {
      const next = Math.min(i + 1, history.length - 1)
      setDraft('')
      return next
    })
    return history[Math.min(index + 1, history.length - 1)]
  }, [history, index])

  const down = useCallback(() => {
    setIndex((i) => {
      const next = i - 1
      if (next < -1) return -1
      return next
    })
    if (index <= 0) {
      setDraft('')
      return ''
    }
    return history[index - 1]
  }, [history, index])

  const clear = useCallback(() => {
    setHistory([])
    setIndex(-1)
    setDraft('')
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { history, add, up, down, clear, draft, setDraft }
}
