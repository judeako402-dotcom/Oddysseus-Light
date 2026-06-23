const test = require('node:test')
const assert = require('node:assert')

test('ai-router returns ok:false when no providers configured', async () => {
  delete process.env.AI_PROVIDER_URL
  delete process.env.AI_PROVIDER_KEY
  delete process.env.AI_FALLBACKS
  const { query } = require('../ai-router')
  const r = await query('test')
  assert.equal(r.ok, false)
  assert.match(r.error, /No AI providers/)
})

test('getProviders returns empty array when nothing configured', () => {
  delete process.env.AI_PROVIDER_URL
  delete process.env.AI_PROVIDER_KEY
  delete process.env.AI_FALLBACKS
  const { getProviders } = require('../ai-router')
  assert.deepEqual(getProviders(), [])
})

test('getProviders returns primary when URL+KEY set', () => {
  process.env.AI_PROVIDER_URL = 'https://example.com/v1'
  process.env.AI_PROVIDER_KEY = 'test-key'
  process.env.AI_MODEL = 'test-model'
  delete process.env.AI_FALLBACKS
  delete require.cache[require.resolve('../ai-router')]
  const { getProviders } = require('../ai-router')
  const providers = getProviders()
  assert.equal(providers.length, 1)
  assert.equal(providers[0].url, 'https://example.com/v1')
  assert.equal(providers[0].key, 'test-key')
  assert.equal(providers[0].model, 'test-model')
})
