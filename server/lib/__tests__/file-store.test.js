const test = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const path = require('path')
const os = require('os')

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'odysseus-test-'))
process.env.OPENCODE_CONFIG_PATH = path.join(tmpDir, 'subdir', 'config.json')

const { getConfig, saveConfig } = require('../file-store')

test('getConfig returns default when file missing', () => {
  const c = getConfig()
  assert.deepEqual(c, { mcp: {} })
})

test('saveConfig creates directories and writes atomically', () => {
  const result = saveConfig({ mcp: { test: 'data' } })
  assert.equal(result.ok, true)
  const written = JSON.parse(fs.readFileSync(result.path, 'utf8'))
  assert.deepEqual(written, { mcp: { test: 'data' } })
})

test('saveConfig overwrites existing file', () => {
  saveConfig({ mcp: { a: 1 } })
  saveConfig({ mcp: { b: 2 } })
  const c = getConfig()
  assert.deepEqual(c, { mcp: { b: 2 } })
})

test.after(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})
