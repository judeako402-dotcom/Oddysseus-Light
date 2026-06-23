import { useState, useEffect } from 'react'

const STORAGE = 'odysseus:automations'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE) || '[]') } catch { return [] }
}

function save(items) {
  try { localStorage.setItem(STORAGE, JSON.stringify(items)) } catch {}
}

export function useSavedAutomations() {
  const [items, setItems] = useState(load)

  const add = (item) => {
    setItems((prev) => {
      const next = [...prev, { id: Date.now().toString(36), ...item }]
      save(next)
      return next
    })
  }

  const remove = (id) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id)
      save(next)
      return next
    })
  }

  return { items, add, remove }
}

export default function SavedAutomations({ items, onRun, onRemove, onClose }) {
  return (
    <div
      className="fixed inset-y-0 left-0 w-80 bg-black/95 border-r border-[var(--accent)]/30 z-40 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="border-b border-[var(--accent)]/20 p-3 flex items-center justify-between">
        <span className="text-xs text-[var(--accent)] font-mono uppercase tracking-widest">
          Saved Automations
        </span>
        <button
          onClick={onClose}
          className="text-[var(--accent)]/60 hover:text-[var(--accent)] font-mono"
        >
          [X]
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.length === 0 && (
          <div className="text-[var(--accent)]/40 font-mono text-xs italic p-2">
            No saved automations
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-[var(--accent)]/20 p-2 hover:border-[var(--accent)]/50"
          >
            <div className="font-mono text-xs text-[var(--accent)] mb-1">{item.name}</div>
            <div className="font-mono text-[10px] text-[var(--accent)]/60 mb-2 truncate" title={item.command}>
              {item.command}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onRun(item)}
                className="flex-1 border border-[var(--accent)]/40 px-2 py-0.5 text-[10px] font-mono text-[var(--accent)] hover:bg-[var(--accent)]/10"
              >
                RUN
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="border border-red-500/40 px-2 py-0.5 text-[10px] font-mono text-red-400 hover:bg-red-500/10"
              >
                DEL
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
