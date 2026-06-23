const THEMES = [
  { id: 'amber', label: 'AMBER', accent: '#ffb000', ring: '255,176,0' },
  { id: 'green', label: 'GREEN', accent: '#33ff33', ring: '51,255,51' },
  { id: 'cyan', label: 'CYAN', accent: '#33ddff', ring: '51,221,255' },
  { id: 'red', label: 'RED', accent: '#ff5544', ring: '255,85,68' },
]

export default function ThemeSwitcher({ theme, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t)}
          title={t.label}
          className={`w-2 h-2 rounded-full transition-all ${
            theme.id === t.id ? 'scale-150 ring-2 ring-offset-2 ring-offset-black' : 'opacity-40 hover:opacity-100'
          }`}
          style={{
            backgroundColor: t.accent,
            '--tw-ring-color': t.accent,
          }}
        />
      ))}
    </div>
  )
}

export { THEMES }
