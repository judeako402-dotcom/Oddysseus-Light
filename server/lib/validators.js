const MAX_INPUT = 500;
const MAX_BODY = 64 * 1024;
const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype'];

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const SHELL_PATTERNS = /[;&|`$<>\\]/g;

function sanitize(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(CONTROL_CHARS, '')
    .replace(SHELL_PATTERNS, '')
    .trim()
    .slice(0, MAX_INPUT);
}

function validateCommand(input) {
  const clean = sanitize(input);
  return { ok: clean.length > 0, value: clean };
}

function validatePrompt(input) {
  const clean = sanitize(input);
  return { ok: clean.length > 0, value: clean };
}

function validateConfig(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, error: 'Config must be an object' };
  }

  const json = JSON.stringify(obj);
  if (json.length > MAX_BODY) {
    return { ok: false, error: 'Config too large' };
  }

  const stack = [obj];
  while (stack.length) {
    const node = stack.pop();
    if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) {
        if (FORBIDDEN_KEYS.includes(key)) {
          return { ok: false, error: 'Forbidden key in config' };
        }
        if (node[key] && typeof node[key] === 'object') {
          stack.push(node[key]);
        }
      }
    }
  }

  return { ok: true, value: obj };
}

function requireAuth(req, res, next) {
  const token = process.env.ODYSSEUS_TOKEN;
  if (!token) return next();

  const header = req.headers.authorization || '';
  const expected = `Bearer ${token}`;

  if (header !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

const buckets = new Map();
const WINDOW_MS = 60_000;
const MAX_REQ = 60;

function rateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = buckets.get(ip) || [];

  const fresh = bucket.filter((t) => now - t < WINDOW_MS);
  if (fresh.length >= MAX_REQ) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  fresh.push(now);
  buckets.set(ip, fresh);

  if (buckets.size > 1000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t > WINDOW_MS)) buckets.delete(k);
    }
  }

  next();
}

module.exports = {
  validateCommand,
  validatePrompt,
  validateConfig,
  requireAuth,
  rateLimit,
  MAX_INPUT,
  MAX_BODY,
};
