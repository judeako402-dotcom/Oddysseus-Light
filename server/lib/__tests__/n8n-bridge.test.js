const test = require('node:test')
const assert = require('node:assert')

test('trigger returns ok:false when n8n unreachable', async () => {
  process.env.N8N_WEBHOOK_URL = 'http://127.0.0.1:1/nonexistent'
  process.env.N8N_TIMEOUT_MS = '1000'
  delete require.cache[require.resolve('../n8n-bridge')]
  const { trigger } = require('../n8n-bridge')
  const r = await trigger('test command')
  assert.equal(r.ok, false)
  assert.equal(r.status, 503)
  assert.match(r.log, /test command/)
})

test('ping returns ok:false when n8n unreachable', async () => {
  process.env.N8N_WEBHOOK_URL = 'http://127.0.0.1:1/nonexistent'
  delete require.cache[require.resolve('../n8n-bridge')]
  const { ping } = require('../n8n-bridge')
  const r = await ping()
  assert.equal(r.ok, false)
  assert.equal(typeof r.latency, 'number')
})
