const fs = require('fs');
const path = require('path');
const pc = require('picocolors');

const CONFIG_PATH = process.env.OPENCODE_CONFIG_PATH || path.join(
  process.env.HOME || process.env.USERPROFILE || __dirname,
  '.config', 'opencode', 'opencode.json'
);

function getConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return { mcp: {} };
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw || '{"mcp":{}}');
  } catch (err) {
    console.error(pc.red(`[file-store] read failed: ${err.message}`));
    return { mcp: {} };
  }
}

function saveConfig(data) {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = CONFIG_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, CONFIG_PATH);
    return { ok: true, path: CONFIG_PATH };
  } catch (err) {
    console.error(pc.red(`[file-store] write failed: ${err.message}`));
    return { ok: false, error: 'Write failed' };
  }
}

module.exports = { getConfig, saveConfig, CONFIG_PATH };
