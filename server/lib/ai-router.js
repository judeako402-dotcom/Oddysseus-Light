const pc = require('picocolors');

const conversations = new Map();
const MAX_HISTORY = 20;

function parseFallbacks(raw) {
  if (!raw) return [];
  return raw.split(',').map(entry => {
    const [url, key, model] = entry.split('|');
    return { url, key: key || '', model: model || 'gpt-3.5-turbo' };
  }).filter((p) => p.url);
}

function getProviders() {
  const providers = [];
  const primaryUrl = process.env.AI_PROVIDER_URL;
  const primaryKey = process.env.AI_PROVIDER_KEY;
  const primaryModel = process.env.AI_MODEL || 'gpt-3.5-turbo';
  if (primaryUrl && primaryKey) {
    providers.push({ url: primaryUrl, key: primaryKey, model: primaryModel });
  }
  providers.push(...parseFallbacks(process.env.AI_FALLBACKS));
  return providers;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callProvider(provider, body, signal) {
  const res = await fetch(`${provider.url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.key}`,
    },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}

function getHistory(conversationId) {
  if (!conversationId) return null;
  return conversations.get(conversationId) || [];
}

function pushHistory(conversationId, role, content) {
  if (!conversationId) return;
  const hist = conversations.get(conversationId) || [];
  hist.push({ role, content });
  if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY);
  conversations.set(conversationId, hist);
}

function buildMessages(prompt, systemPrompt, history) {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  if (history && history.length) messages.push(...history);
  messages.push({ role: 'user', content: prompt });
  return messages;
}

async function query(prompt, systemPrompt = '', opts = {}) {
  const { conversationId, temperature = 0.7, maxTokens = 1024 } = opts;
  const providers = getProviders();

  if (providers.length === 0) {
    return { ok: false, error: 'No AI providers configured' };
  }

  const history = getHistory(conversationId);
  const messages = buildMessages(prompt, systemPrompt, history);
  let lastError = null;

  for (const provider of providers) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(pc.cyan(`[ai] ${provider.url} attempt ${attempt + 1}`));
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        const data = await callProvider(provider, {
          model: provider.model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }, controller.signal);
        clearTimeout(timeout);
        const text = data.choices?.[0]?.message?.content || '';
        pushHistory(conversationId, 'user', prompt);
        pushHistory(conversationId, 'assistant', text);
        return {
          ok: true,
          provider: provider.url,
          model: provider.model,
          text,
          usage: data.usage || null,
        };
      } catch (err) {
        lastError = err;
        const isRetryable = err.message.includes('429') || err.message.includes('5');
        if (isRetryable && attempt === 0) {
          await sleep(1000 * (attempt + 1));
          continue;
        }
        console.log(pc.yellow(`[ai] ${provider.url} failed: ${err.message}`));
        break;
      }
    }
  }
  return { ok: false, error: lastError?.message || 'All providers failed' };
}

module.exports = { query, getProviders };
