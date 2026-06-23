import { useState, useCallback, useEffect, useRef } from 'react'
import CommandBar from './components/CommandBar'
import Telemetry from './components/Telemetry'
import TerminalLog, { MAX_LINES } from './components/TerminalLog'
import NodeCanvas from './components/NodeCanvas'
import ErrorBoundary from './components/ErrorBoundary'
import ShortcutHelp from './components/ShortcutHelp'
import CommandHistory from './components/CommandHistory'
import ThemeSwitcher, { THEMES } from './components/ThemeSwitcher'
import SavedAutomations, { useSavedAutomations } from './components/SavedAutomations'
import { useHealth, useStats, useN8nHealth } from './hooks/useApi'
import { useCommandHistory } from './hooks/useCommandHistory'

const API_BASE = '/api'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export default function App() {
  const [logs, setLogs] = useState([])
  const [mode, setMode] = useState('cmd')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showAutomations, setShowAutomations] = useState(false)
  const [theme, setTheme] = useState(() => {
    try {
      return THEMES.find((t) => t.id === localStorage.getItem('odysseus:theme')) || THEMES[0]
    } catch {
      return THEMES[0]
    }
  })
  const [lastCommand, setLastCommand] = useState(null)
  const conversationIdRef = useRef('default')

  const health = useHealth()
  const stats = useStats()
  const n8nStatus = useN8nHealth()
  const history = useCommandHistory()
  const automations = useSavedAutomations()

  useEffect(() => {
    try { localStorage.setItem('odysseus:theme', theme.id) } catch {}
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', theme.accent)
  }, [theme])

  const addLog = useCallback((text, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false })
    setLogs((prev) => {
      const next = [...prev, { id: generateId(), time, text, type }]
      return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next
    })
  }, [])

  useEffect(() => {
    addLog('System initialized. ODYSSEUS core ready.', 'system')
  }, [addLog])

  useEffect(() => {
    if (health.error) addLog('Backend unreachable', 'error')
  }, [health.error, addLog])

  const clearLogs = useCallback(() => {
    setLogs([])
    addLog('Log cleared', 'system')
  }, [addLog])

  const executeCommand = useCallback(async (input) => {
    addLog(`> ${input}`, 'system')
    history.add(input)
    setLastCommand(input)
    setError(null)
    setLoading(true)

    try {
      if (mode === 'cmd') {
        const res = await fetch(`${API_BASE}/automation/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: input, payload: {} }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed')
        addLog(`n8n -> ${data.status}${data.log ? ` (${data.log})` : ''}`, data.ok === false ? 'error' : 'success')
      } else {
        const res = await fetch(`${API_BASE}/ai/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: input,
            systemPrompt: 'You are a local automation assistant. Be concise.',
            conversationId: conversationIdRef.current,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.error || 'AI error')
        addLog(`AI [${data.model}]: ${data.text}`, 'ai')
        if (data.usage) {
          addLog(`Tokens: ${data.usage.total_tokens || '?'} (in: ${data.usage.prompt_tokens || '?'} / out: ${data.usage.completion_tokens || '?'})`, 'system')
        }
      }
    } catch (err) {
      setError(err.message)
      addLog(`Error: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [mode, addLog, history])

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'cmd' ? 'ai' : 'cmd'))
    addLog(`Switched to ${mode === 'cmd' ? 'AI' : 'Command'} mode`, 'system')
  }, [mode, addLog])

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Escape') e.target.blur()
        return
      }
      if (e.key === '?') setShowHelp((s) => !s)
      else if (e.ctrlKey && e.key === 'l') { e.preventDefault(); clearLogs() }
      else if (e.ctrlKey && e.key === 'k') { e.preventDefault(); document.querySelector('input[type="text"]')?.focus() }
      else if (e.ctrlKey && e.key === 'h') { e.preventDefault(); setShowHistory((s) => !s) }
      else if (e.key === 'Escape') { setShowHelp(false); setShowHistory(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clearLogs])

  return (
    <div className="h-screen flex flex-col bg-black text-[var(--accent)] font-mono">
      {health.error && (
        <div className="bg-red-500/20 border-b border-red-500/50 text-red-300 text-xs font-mono text-center py-1">
          BACKEND OFFLINE — running in local-only mode
        </div>
      )}

      <header className="border-b border-[var(--accent)]/20 px-4 py-2 flex items-center justify-between bg-black/50">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-[var(--accent)] tracking-widest">ODYSSEUS</span>
          <span className="text-[10px] text-[var(--accent)]/50 uppercase tracking-[0.2em]">
            Local Automation Cockpit
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <button
            onClick={() => setShowAutomations((s) => !s)}
            className="text-[var(--accent)]/60 hover:text-[var(--accent)] font-mono uppercase tracking-widest"
            title="Saved automations"
          >
            Macros
          </button>
          <button
            onClick={() => setShowHistory((s) => !s)}
            className="text-[var(--accent)]/60 hover:text-[var(--accent)] font-mono uppercase tracking-widest"
            title="Ctrl+H"
          >
            History
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="text-[var(--accent)]/60 hover:text-[var(--accent)] font-mono"
          >
            [?]
          </button>
          <ThemeSwitcher theme={theme} onChange={setTheme} />
          <span className="flex items-center gap-1 text-[var(--accent)]/60">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            ONLINE
          </span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-[220px_1fr_220px] gap-px bg-[var(--accent)]/10 overflow-hidden">
        <ErrorBoundary>
          <Telemetry health={health} stats={stats} n8nStatus={n8nStatus} />
        </ErrorBoundary>
        <ErrorBoundary>
          <TerminalLog logs={logs} onClear={clearLogs} />
        </ErrorBoundary>
        <ErrorBoundary>
          <NodeCanvas health={health} n8nStatus={n8nStatus} lastCommand={lastCommand} />
        </ErrorBoundary>
      </main>

      <ErrorBoundary>
        <CommandBar
          onExecute={executeCommand}
          mode={mode}
          onToggleMode={toggleMode}
          history={history}
          loading={loading}
          error={error}
        />
      </ErrorBoundary>

      {showHelp && <ShortcutHelp onClose={() => setShowHelp(false)} />}
      {showAutomations && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowAutomations(false)}>
          <SavedAutomations
            items={automations.items}
            onRun={(item) => {
              executeCommand(item.command)
              setShowAutomations(false)
            }}
            onRemove={automations.remove}
            onClose={() => setShowAutomations(false)}
          />
        </div>
      )}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowHistory(false)}>
          <CommandHistory
            history={history.history}
            onSelect={(cmd) => {
              executeCommand(cmd)
              setShowHistory(false)
            }}
            onClose={() => setShowHistory(false)}
            onClear={history.clear}
          />
        </div>
      )}
    </div>
  )
}
