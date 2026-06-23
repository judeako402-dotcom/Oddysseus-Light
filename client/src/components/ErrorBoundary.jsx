import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="h-full flex items-center justify-center p-8 bg-obsidian">
        <div className="border border-terminal-red/50 bg-black/80 p-6 max-w-lg w-full">
          <div className="text-terminal-red font-mono text-sm mb-2 tracking-widest">
            RUNTIME FAULT DETECTED
          </div>
          <div className="text-amber-400 font-mono text-xs mb-4 break-all">
            {String(this.state.error?.message || this.state.error || 'Unknown error')}
          </div>
          <button
            onClick={this.reset}
            className="border border-amber-500 px-4 py-1 text-amber-400 font-mono text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-black"
          >
            Reset Cockpit
          </button>
        </div>
      </div>
    )
  }
}
