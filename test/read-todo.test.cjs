const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the real module with only dotenv substituted. No live Notion calls.
const sandbox = { module: { exports: {} }, console: { log() {} }, require(name) {
  assert.equal(name, 'dotenv');
  return { config() {} };
} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8'), sandbox);
const { readTodo } = sandbox.module.exports;
const plain = value => JSON.parse(JSON.stringify(value));

test('a sparse page does not make the entire task list fail', async () => {
  const notion = { databases: { query: async () => ({ results: [
    { id: 'complete', url: 'https://example.test/complete', properties: {
      Todo: { title: [{ plain_text: 'Practice CRUD' }] }, Priority: { select: { name: 'High' } },
      Status: { select: { name: 'Scheduled' } }, Remarks: { rich_text: [] }
    } },
    { id: 'sparse', url: 'https://example.test/sparse', properties: {} }
  ] }) } };
  const result = await readTodo(notion, 'local-test');
  assert.equal(result.success, true);
  assert.equal(result.results.length, 2);
  assert.equal(result.results[0].title, 'Practice CRUD');
  assert.equal(result.results[1].pageID, 'sparse');
});

test('missing title and rich-text arrays are safe to read', async () => {
  const notion = { databases: { query: async () => ({ results: [
    { id: 'empty', properties: { Todo: {}, Remarks: {}, Priority: { select: null } } }
  ] }) } };
  const result = await readTodo(notion, 'local-test');
  assert.equal(result.success, true);
  assert.equal(result.results[0].title, undefined);
});

test('empty databases still return a successful empty list', async () => {
  const notion = { databases: { query: async () => ({ results: [] }) } };
  assert.deepEqual(plain(await readTodo(notion, 'local-test')), { success: true, results: [] });
});

test('upstream rejection retains the existing failure contract', async () => {
  const notion = { databases: { query: async () => { throw Object.assign(new Error('offline'), { status: 503 }); } } };
  assert.deepEqual(plain(await readTodo(notion, 'local-test')), { success: false });
});
