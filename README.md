# Odysseus — Local Automation Cockpit

A zero-cost, lightweight local automation cockpit. A retro terminal dashboard talks to a Node.js bridge that handles file I/O, proxies commands to a self-hosted n8n instance, and routes prompts through free AI API providers.

## Architecture

```
        ┌──────────────────────────────────────────┐
        │   Browser  (http://localhost:5173)       │
        │   React + Vite + Tailwind Dashboard      │
        └────────────────┬─────────────────────────┘
                         │ /api/*
        ┌────────────────▼─────────────────────────┐
        │   Server  (http://localhost:4000)        │
        │   Express, dotenv, picocolors            │
        │                                          │
        │  /health  /config  /automation/trigger   │
        │  /ai/query  /ai/models  /stats           │
        │  /health/n8n                             │
        └────┬─────────────────┬─────────────┬─────┘
             │                 │             │
        ┌────▼─────┐    ┌──────▼──────┐  ┌───▼────────┐
        │  n8n     │    │  AI Router  │  │  File      │
        │ :5678    │    │  (OpenAI-   │  │  System    │
        │ webhook  │    │  compatible)│  │  opencode  │
        └──────────┘    └─────────────┘  │  .json     │
                                         └────────────┘
```

## Quick Start

```bash
# Install root dev tooling (concurrently)
npm install

# Set up server
cd server
cp .env.example .env       # edit with your AI provider key
npm install

# Set up client
cd ../client
npm install

# Run both with one command (from project root)
cd ..
npm run dev
```

Dashboard: `http://localhost:5173` — Backend: `http://localhost:4000`

## Configuration

Edit `server/.env`:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | 4000 | Backend port |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |
| `ODYSSEUS_TOKEN` | unset | Optional bearer token for POST routes |
| `AI_PROVIDER_URL` | — | OpenAI-compatible endpoint |
| `AI_PROVIDER_KEY` | — | API key |
| `AI_MODEL` | — | Model name |
| `N8N_WEBHOOK_URL` | localhost:5678 | n8n webhook |
| `N8N_TIMEOUT_MS` | 5000 | n8n request timeout |
| `OPENCODE_CONFIG_PATH` | ~/.config/opencode/opencode.json | Config file location |

Free AI providers (no credit card required):
- [OpenRouter](https://openrouter.ai/keys) — multi-model
- [Groq](https://console.groq.com/keys) — fast inference
- [Google AI Studio](https://aistudio.google.com/apikey) — Gemini (use `https://generativelanguage.googleapis.com/v1beta/openai`)

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Status, uptime, auth mode |
| GET | `/api/stats` | Yes | Memory, CPU, Node version |
| GET | `/api/health/n8n` | Yes | n8n reachability + latency |
| GET | `/api/config` | Yes | Read opencode.json |
| POST | `/api/config/update` | Yes | Write opencode.json (atomic) |
| POST | `/api/automation/trigger` | Yes | Forward command to n8n webhook |
| GET | `/api/ai/models` | Yes | Configured providers |
| POST | `/api/ai/query` | Yes | Prompt free LLM, optional `conversationId` |

When `ODYSSEUS_TOKEN` is set, send it as `Authorization: Bearer <token>`.

## Security

- Input validation on all routes (length cap, control-char strip, shell-pattern strip)
- Prototype pollution guard on config writes
- CORS restricted to `CORS_ORIGIN` (not `*`)
- Rate limit: 60 req/min per IP (in-memory, zero deps)
- Optional bearer-token auth on all POST routes
- Atomic file writes (write to `.tmp`, rename) — no partial writes
- Body limit 256 KB
- 1 server-side connection timeout, configurable

## Testing

```bash
npm test
```

Built on Node's built-in test runner — zero test dependencies.

## Docker

```bash
docker-compose up
```

Brings up server (`:4000`), client (`:8080`), and n8n (`:5678`).

## Keyboard Shortcuts

| Key | Action |
|---|---|
| Enter | Execute command |
| Up / Down | Navigate command history |
| Tab | Autocomplete from history |
| Ctrl + L | Clear terminal log |
| Ctrl + K | Focus command bar |
| Ctrl + H | Toggle command history drawer |
| ? | Show all shortcuts |
| Esc | Close drawer / dialog |

## Features

- Command history with localStorage persistence
- Saved automations (macros) with one-click run
- Real server stats (CPU, memory, RSS, uptime)
- n8n health check with latency
- AI conversation context (per-session)
- Theme switcher (amber/green/cyan/red)
- Voice input via Web Speech API
- Log filter, export to TXT/JSON
- 500-line rolling log buffer
- Graceful shutdown on SIGINT/SIGTERM
- Backend offline detection with banner
- Error boundaries around each panel
- Exponential backoff for AI rate limits
- Multi-provider AI fallback

## Project Structure

```
odysseus/
├── package.json            Root orchestrator (npm run dev)
├── docker-compose.yml
├── Dockerfile.server
├── Dockerfile.client
├── client/                 Vite + React + Tailwind
│   ├── nginx.conf
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── components/     ErrorBoundary, CommandBar, Telemetry, ...
│       └── hooks/          useApi, useCommandHistory
└── server/                 Express + dotenv
    ├── .env.example
    └── lib/
        ├── server.js
        ├── validators.js   Input validation, auth, rate limit
        ├── file-store.js   Atomic config I/O
        ├── n8n-bridge.js   n8n proxy with timeout
        ├── ai-router.js    Multi-provider LLM routing
        └── __tests__/      Built-in node:test suite
```

## Dependencies

**Server runtime**: express, cors, dotenv, picocolors — 4 packages total.
**Server dev**: only `concurrently` (root, optional).
**Client runtime**: react, react-dom — 2 packages.
**Client dev**: vite, tailwindcss, autoprefixer, postcss — 4 packages.

Zero unused deps, zero bloat.
