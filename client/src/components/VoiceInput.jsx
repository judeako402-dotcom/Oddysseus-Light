import { useState, useEffect } from 'react'

export default function VoiceInput({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))
  }, [])

  if (!supported) return null

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      onTranscript(text)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.start()
    setListening(true)
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={disabled || listening}
      className={`px-2 py-1 text-xs font-mono uppercase border transition-all ${
        listening
          ? 'border-red-500 text-red-400 animate-pulse'
          : 'border-[var(--accent)]/40 text-[var(--accent)]/60 hover:border-[var(--accent)] hover:text-[var(--accent)]'
      }`}
      title="Voice input"
    >
      {listening ? 'REC' : 'MIC'}
    </button>
  )
}
