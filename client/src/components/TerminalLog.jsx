import { useEffect, useRef, useState } from 'react'

const MAX_LINES = 500
const colors = {
  info: 'text-[var(--accent)]',
  success: 'text-green-400',
  error: 'text-red-400',
  system: 'text-cyan-400',
  ai: 'text-green-300',
}

function exportTxt(logs) {
  const text = logs.map((l) => `[${l.time}] ${l.text}`).join('\n')
  download(`odysseus-log-${Date.now()}.txt`, text, 'text/plain')
}

function exportJson(logs) {
  download(`odysseus-log-${Date.now()}.json`, JSON.stringify(logs, null, 2), 'application/json')
}

function download(name, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export default function TerminalLog({ logs, onClear }) {
  const bottomRef = useRef(null)
  const [filter, setFilter] = useState('')

  const visible = filter
    ? logs.filter((l) => l.text.toLowerCase().includes(filter.toLowerCase()))
    : logs

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [visible.length])

  return (
    <div className="border border-[var(--accent)]/20 bg-black/80 p-3 h-full flex flex-col">
      <div className="text-xs text-[var(--accent)]/70 font-mono uppercase tracking-widest mb-3 border-b border-[var(--accent)]/20 pb-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Terminal Log
        <span className="text-[var(--accent)]/50 ml-auto text-[10px]">
          {visible.length}/{logs.length} entries
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter..."
          className="flex-1 bg-black/60 border border-[var(--accent)]/20 px-2 py-0.5 text-xs font-mono text-[var(--accent)] outline-none focus:border-[var(--accent)]/50"
        />
        <button
          onClick={() => exportTxt(logs)}
          className="border border-[var(--accent)]/30 px-2 py-0.5 text-[10px] font-mono text-[var(--accent)]/70 hover:bg-[var(--accent)]/10"
          title="Export as TXT"
        >
          TXT
        </button>
        <button
          onClick={() => exportJson(logs)}
          className="border border-[var(--accent)]/30 px-2 py-0.5 text-[10px] font-mono text-[var(--accent)]/70 hover:bg-[var(--accent)]/10"
          title="Export as JSON"
        >
          JSON
        </button>
        <button
          onClick={onClear}
          className="border border-[var(--accent)]/30 px-2 py-0.5 text-[10px] font-mono text-[var(--accent)]/70 hover:bg-[var(--accent)]/10"
          title="Clear log (Ctrl+L)"
        >
          CLEAR
        </button>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1">
        {visible.length === 0 && (
          <div className="text-[var(--accent)]/40 italic">
            {filter ? 'No matches' : 'Awaiting command input...'}
          </div>
        )}
        {visible.map((log) => (
          <div key={log.id} className="leading-relaxed break-words">
            <span className="text-[var(--accent)]/50 mr-2">[{log.time}]</span>
            <span className={colors[log.type] || 'text-[var(--accent)]'}>{log.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export { MAX_LINES }
