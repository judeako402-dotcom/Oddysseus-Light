const SHORTCUTS = [
  { key: 'Enter', desc: 'Execute command' },
  { key: '↑ / ↓', desc: 'Navigate command history' },
  { key: 'Tab', desc: 'Autocomplete from history' },
  { key: 'Ctrl + L', desc: 'Clear terminal log' },
  { key: 'Ctrl + K', desc: 'Focus command bar' },
  { key: 'Ctrl + H', desc: 'Toggle command history drawer' },
  { key: '?', desc: 'Show this help' },
  { key: 'Esc', desc: 'Close help / drawer' },
]

export default function ShortcutHelp({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="border border-amber-500/40 bg-black/95 p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs text-amber-600 font-mono uppercase tracking-widest mb-4 border-b border-amber-500/20 pb-2">
          Keyboard Shortcuts
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex justify-between items-center font-mono text-xs">
              <span className="text-amber-300">{s.desc}</span>
              <kbd className="border border-amber-500/40 px-2 py-0.5 text-amber-500 bg-amber-500/5">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 border border-amber-500 px-4 py-1 text-amber-400 font-mono text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-black w-full"
        >
          Close
        </button>
      </div>
    </div>
  )
}
