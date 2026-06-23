export default function Telemetry({ health, stats, n8nStatus }) {
  const upMin = Math.floor((stats?.data?.uptime || 0) / 60)
  const upSec = Math.floor((stats?.data?.uptime || 0) % 60)

  const items = [
    { label: 'BACKEND', value: health?.error ? 'OFFLINE' : 'ONLINE', color: health?.error ? 'text-red-400' : 'text-[var(--accent)]' },
    { label: 'AUTH', value: health?.data?.auth || '?', color: 'text-[var(--accent)]' },
    { label: 'n8n', value: n8nStatus?.data?.ok ? `${n8nStatus.data.latency}ms` : 'OFFLINE', color: n8nStatus?.data?.ok ? 'text-[var(--accent)]' : 'text-red-400' },
    { label: 'AI', value: health?.data?.ai ? 'READY' : 'NO KEY', color: health?.data?.ai ? 'text-[var(--accent)]' : 'text-amber-400' },
    { label: 'UPTIME', value: `${upMin}m${upSec}s`, color: 'text-[var(--accent)]' },
    { label: 'MEM', value: `${stats?.data?.memory?.heapUsed || '?'}MB`, color: 'text-[var(--accent)]' },
    { label: 'RSS', value: `${stats?.data?.memory?.rss || '?'}MB`, color: 'text-[var(--accent)]' },
    { label: 'NODE', value: stats?.data?.node || '?', color: 'text-[var(--accent)]' },
  ]

  return (
    <div className="border border-[var(--accent)]/20 bg-black/60 p-3 h-full flex flex-col">
      <div className="text-xs text-[var(--accent)]/70 font-mono uppercase tracking-widest mb-3 border-b border-[var(--accent)]/20 pb-2">
        Telemetry
      </div>
      <div className="space-y-2 flex-1">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-xs text-[var(--accent)]/60 font-mono">{item.label}</span>
            <span className={`text-xs font-mono ${item.color} animate-pulse-slow`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-[var(--accent)]/50 font-mono mt-auto pt-2 border-t border-[var(--accent)]/20">
        SYS::{health?.error ? 'FAULT' : 'NOMINAL'}
      </div>
    </div>
  )
}
