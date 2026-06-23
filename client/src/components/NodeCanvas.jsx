const NODES = [
  { id: 'cli', label: 'CLI', x: 15, y: 20 },
  { id: 'n8n', label: 'n8n', x: 65, y: 20 },
  { id: 'ai', label: 'AI', x: 40, y: 50 },
  { id: 'fs', label: 'FS', x: 15, y: 80 },
  { id: 'api', label: 'API', x: 65, y: 80 },
]

const LINES = [
  ['cli', 'n8n'],
  ['n8n', 'ai'],
  ['ai', 'fs'],
  ['ai', 'api'],
  ['cli', 'fs'],
]

function nodePos(id) {
  return NODES.find((n) => n.id === id)
}

function getStatus(nodeId, health, n8nStatus, lastCommand) {
  if (nodeId === 'cli') return lastCommand ? 'active' : 'idle'
  if (nodeId === 'n8n') return n8nStatus?.ok ? 'active' : 'standby'
  if (nodeId === 'ai') return health?.data?.ai ? 'active' : 'standby'
  if (nodeId === 'fs') return 'active'
  if (nodeId === 'api') return 'active'
  return 'idle'
}

const colors = {
  active: 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]',
  standby: 'bg-amber-400/80',
  idle: 'bg-amber-700/40',
  error: 'bg-red-500',
}

export default function NodeCanvas({ health, n8nStatus, lastCommand }) {
  const status = (id) => getStatus(id, health, n8nStatus, lastCommand)

  return (
    <div className="border border-[var(--accent)]/20 bg-black/60 p-3 h-full flex flex-col">
      <div className="text-xs text-[var(--accent)]/70 font-mono uppercase tracking-widest mb-3 border-b border-[var(--accent)]/20 pb-2">
        Automation Grid
      </div>
      <div className="flex-1 relative bg-black/40 rounded border border-[var(--accent)]/10 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {LINES.map(([a, b]) => {
            const p1 = nodePos(a)
            const p2 = nodePos(b)
            return (
              <line
                key={`${a}-${b}`}
                x1={`${p1.x}%`}
                y1={`${p1.y}%`}
                x2={`${p2.x}%`}
                y2={`${p2.y}%`}
                stroke="var(--accent)"
                strokeWidth="0.5"
                opacity="0.3"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 bg-scan-line opacity-5 animate-scan pointer-events-none" />
        {NODES.map((node) => {
          const s = status(node.id)
          return (
            <div
              key={node.id}
              className="absolute flex flex-col items-center gap-1"
              style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
              title={`${node.label}: ${s}`}
            >
              <div className={`w-3 h-3 rounded-full ${colors[s]} animate-pulse-slow`} />
              <span className="text-[10px] font-mono text-[var(--accent)]/80">{node.label}</span>
            </div>
          )
        })}
      </div>
      <div className="text-[10px] text-[var(--accent)]/60 font-mono mt-2 pt-2 border-t border-[var(--accent)]/20 flex gap-3 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" /> Active
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400/80" /> Standby
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-700/40" /> Idle
        </span>
        {n8nStatus?.latency != null && (
          <span className="ml-auto">n8n: {n8nStatus.latency}ms</span>
        )}
      </div>
    </div>
  )
}
