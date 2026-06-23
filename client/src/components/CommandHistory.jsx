export default function CommandHistory({ history, onSelect, onClose, onClear }) {
  return (
    <div
      className="fixed inset-y-0 right-0 w-80 bg-black/95 border-l border-[var(--accent)]/30 z-40 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="border-b border-[var(--accent)]/20 p-3 flex items-center justify-between">
        <span className="text-xs text-[var(--accent)] font-mono uppercase tracking-widest">
          Command History
        </span>
        <div className="flex gap-2">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] font-mono text-red-400/70 hover:text-red-400"
            >
              CLEAR
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[var(--accent)]/60 hover:text-[var(--accent)] font-mono"
          >
            [X]
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {history.length === 0 && (
          <div className="text-[var(--accent)]/40 font-mono text-xs italic p-2">
            No commands yet
          </div>
        )}
        {history.map((cmd, i) => (
          <button
            key={i}
            onClick={() => onSelect(cmd)}
            className="w-full text-left px-2 py-1 font-mono text-xs text-[var(--accent)]/80 hover:bg-[var(--accent)]/10 border border-transparent hover:border-[var(--accent)]/30 truncate"
            title={cmd}
          >
            &gt; {cmd}
          </button>
        ))}
      </div>
    </div>
  )
}
