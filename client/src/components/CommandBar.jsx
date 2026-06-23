import { useState, useRef, useEffect } from 'react'
import VoiceInput from './VoiceInput'

export default function CommandBar({ onExecute, mode, onToggleMode, history, loading, error }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (error) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 400)
      return () => clearTimeout(t)
    }
  }, [error])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    onExecute(input)
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = history.up(input)
      if (prev != null) setInput(prev)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = history.down()
      if (next != null) setInput(next)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const match = history.history.find((h) => h.startsWith(input))
      if (match) setInput(match)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`border-t border-[var(--accent)]/30 bg-black/90 p-3 flex items-center gap-3 ${
        shake ? 'animate-pulse' : ''
      }`}
      style={shake ? { boxShadow: '0 0 20px rgba(255,85,68,0.5)' } : undefined}
    >
      <button
        type="button"
        onClick={onToggleMode}
        className={`px-2 py-1 text-xs font-mono uppercase tracking-widest border transition-all ${
          mode === 'cmd'
            ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]'
            : 'bg-green-500/10 border-green-400 text-green-400'
        }`}
      >
        [{mode}]
      </button>
      <span className="text-[var(--accent)] font-mono text-sm">ODYSSEUS_&gt;</span>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={loading ? 'Processing...' : 'Issue direct order or ask AI...'}
        disabled={loading}
        className="flex-1 bg-transparent border-none outline-none text-[var(--accent)] font-mono text-sm placeholder-[var(--accent)]/40 disabled:opacity-50"
      />
      <VoiceInput
        onTranscript={(t) => setInput((cur) => (cur ? `${cur} ${t}` : t))}
        disabled={loading}
      />
      <span className="text-[var(--accent)]/40 font-mono text-xs w-16 text-right">
        {loading ? '•••' : ''}
      </span>
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="bg-[var(--accent)]/20 border border-[var(--accent)]/60 px-4 py-1 text-xs text-[var(--accent)] font-mono uppercase tracking-widest hover:bg-[var(--accent)] hover:text-black transition-all disabled:opacity-30"
      >
        Execute
      </button>
    </form>
  )
}
