const pc = require('picocolors');

const DEFAULT_N8N_URL = 'http://localhost:5678/webhook-test/odysseus-command';

async function trigger(command, payload = {}) {
  const url = process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_URL;
  const timeout = parseInt(process.env.N8N_TIMEOUT_MS || '5000', 10);

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command,
        payload,
        timestamp: new Date().toISOString(),
        source: 'odysseus',
      }),
      signal: controller.signal,
    });
    clearTimeout(t);
    console.log(pc.green(`[n8n] Triggered -> ${res.status}`));
    return { ok: true, status: res.status, statusText: res.statusText };
  } catch (err) {
    console.log(pc.yellow(`[n8n] Offline: ${err.message}`));
    return {
      ok: false,
      status: 503,
      statusText: 'n8n unavailable',
      log: `Executed locally: ${command}`,
    };
  }
}

async function ping() {
  const url = process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_URL;
  const start = Date.now();
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { method: 'GET', signal: controller.signal }).catch(() => null);
    clearTimeout(t);
    const latency = Date.now() - start;
    if (res && res.ok) return { ok: true, latency };
    return { ok: false, latency, status: res?.status || 0 };
  } catch {
    return { ok: false, latency: Date.now() - start };
  }
}

module.exports = { trigger, ping };
