const test = require('node:test')
const assert = require('node:assert')
const { validateCommand, validatePrompt, validateConfig, MAX_INPUT } = require('../validators')

test('validateCommand strips control chars and shell patterns', () => {
  const r = validateCommand('hello; rm -rf /')
  assert.equal(r.ok, true)
  assert.equal(r.value, 'hello rm -rf /')
})

test('validateCommand caps length at MAX_INPUT', () => {
  const long = 'a'.repeat(MAX_INPUT + 100)
  const r = validateCommand(long)
  assert.equal(r.value.length, MAX_INPUT)
})

test('validateCommand rejects empty', () => {
  assert.equal(validateCommand('   ').ok, false)
  assert.equal(validateCommand('').ok, false)
})

test('validatePrompt trims and slices', () => {
  const r = validatePrompt('  test prompt  ')
  assert.equal(r.value, 'test prompt')
})

test('validateConfig rejects arrays at root', () => {
  assert.equal(validateConfig([]).ok, false)
})

test('validateConfig blocks __proto__ keys', () => {
  const evil = JSON.parse('{"__proto__":{"polluted":true}}')
  assert.equal(validateConfig(evil).ok, false)
})

test('validateConfig blocks constructor keys', () => {
  const evil = JSON.parse('{"constructor":{"prototype":{"x":1}}}')
  assert.equal(validateConfig(evil).ok, false)
})

test('validateConfig accepts valid objects', () => {
  const ok = validateConfig({ mcp: { servers: ['a', 'b'] } })
  assert.equal(ok.ok, true)
})
