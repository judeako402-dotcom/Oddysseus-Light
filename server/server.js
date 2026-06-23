require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pc = require('picocolors');
const { getConfig, saveConfig, CONFIG_PATH } = require('./lib/file-store');
const n8n = require('./lib/n8n-bridge');
const ai = require('./lib/ai-router');
const { validateCommand, validatePrompt, validateConfig, requireAuth, rateLimit } = require('./lib/validators');

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const HAS_TOKEN = !!process.env.ODYSSEUS_TOKEN;

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '256kb' }));
app.use(rateLimit);

app.use((req, _res, next) => {
  const t = Date.now();
  process.nextTick(() => {
    const ms = Date.now() - t;
    if (req.path.startsWith('/api/')) {
      console.log(pc.dim(`[${req.method}] ${req.path} ${ms}ms`));
    }
  });
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    port: PORT,
    ai: ai.getProviders().length > 0,
    config: 'loaded',
    auth: HAS_TOKEN ? 'enabled' : 'disabled',
  });
});

app.get('/api/config', requireAuth, (_req, res) => {
  res.json(getConfig());
});

app.post('/api/config/update', requireAuth, (req, res) => {
  const v = validateConfig(req.body);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const result = saveConfig(v.value);
  if (!result.ok) return res.status(500).json({ error: result.error });
  res.json({ status: 'SUCCESS_INJECTED', path: result.path });
});

app.post('/api/automation/trigger', requireAuth, async (req, res) => {
  const v = validateCommand(req.body?.command);
  if (!v.ok) return res.status(400).json({ error: 'Invalid command' });
  const result = await n8n.trigger(v.value, req.body?.payload || {});
  res.json({
    status: result.ok ? 'TRIGGERED_LOCAL_N8N' : 'SIMULATED_LOCAL_ROUTING',
    ...result,
  });
});

app.post('/api/ai/query', requireAuth, async (req, res) => {
  const v = validatePrompt(req.body?.prompt);
  if (!v.ok) return res.status(400).json({ error: 'Invalid prompt' });
  const systemPrompt = typeof req.body?.systemPrompt === 'string' ? req.body.systemPrompt.slice(0, 1000) : '';
  const conversationId = typeof req.body?.conversationId === 'string' ? req.body.conversationId.slice(0, 64) : null;
  const temperature = typeof req.body?.temperature === 'number' ? Math.min(2, Math.max(0, req.body.temperature)) : 0.7;
  const maxTokens = typeof req.body?.maxTokens === 'number' ? Math.min(4096, Math.max(1, req.body.maxTokens)) : 1024;
  const result = await ai.query(v.value, systemPrompt, { conversationId, temperature, maxTokens });
  res.json(result);
});

app.get('/api/ai/models', requireAuth, (_req, res) => {
  res.json({ providers: ai.getProviders() });
});

app.get('/api/stats', requireAuth, (_req, res) => {
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();
  res.json({
    uptime: process.uptime(),
    memory: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    },
    cpu: {
      user: Math.round(cpu.user / 1000),
      system: Math.round(cpu.system / 1000),
    },
    node: process.version,
  });
});

app.get('/api/health/n8n', requireAuth, async (_req, res) => {
  const result = await n8n.ping();
  res.json(result);
});

const server = app.listen(PORT, () => {
  console.log(pc.bold(pc.cyan('\n  ODYSSEUS CORE ENGINE ONLINE\n')));
  console.log(`  Port:     ${pc.green(PORT)}`);
  console.log(`  CORS:     ${pc.dim(CORS_ORIGIN)}`);
  console.log(`  Config:   ${pc.dim(CONFIG_PATH)}`);
  console.log(`  n8n:      ${pc.dim(process.env.N8N_WEBHOOK_URL || 'http://localhost:5678')}`);
  console.log(`  AI:       ${pc.dim(ai.getProviders().length > 0 ? `${ai.getProviders().length} provider(s)` : 'none configured')}`);
  console.log(`  Auth:     ${pc.dim(HAS_TOKEN ? 'enabled (ODYSSEUS_TOKEN set)' : pc.yellow('DISABLED — set ODYSSEUS_TOKEN to protect routes'))}`);
  console.log();
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log(pc.dim(`\n[${sig}] Shutting down...`));
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 3000);
  });
}
