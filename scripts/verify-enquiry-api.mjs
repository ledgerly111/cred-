import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/enquiries.js';

const calls = [];
const DB = {
  prepare(sql) {
    return {
      bind(...values) {
        const statement = {
          sql,
          values,
          async first() { calls.push({ type: 'first', sql, values }); return { total: 0 }; },
          async run() { calls.push({ type: 'run', sql, values }); return { meta: { changes: 1 } }; },
        };
        return statement;
      },
    };
  },
  async batch(statements) { calls.push({ type: 'batch', statements }); return statements.map(() => ({ success: true })); },
};

let background;
const request = new Request('https://crededu.com/api/enquiries', {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'https://crededu.com', 'CF-Connecting-IP': '203.0.113.4' },
  body: JSON.stringify({
    name: 'Test Student',
    email: 'student@example.com',
    phone: '+971500000000',
    profile: 'Working professional',
    interest: 'Postgraduate study',
    goals: 'Advance my career.',
    consent: true,
    website: '',
    startedAt: Date.now() - 3000,
  }),
});

const response = await onRequest({
  request,
  env: { DB, RATE_LIMIT_SALT: 'test-only' },
  waitUntil(promise) { background = promise; },
});
const result = await response.json();
assert.equal(response.status, 202);
assert.equal(result.ok, true);
assert.match(result.reference, /^[0-9a-f-]{36}$/);
assert.equal(calls.some(call => call.type === 'batch'), true);
const originalConsoleError = console.error;
console.error = () => {};
try { await background; } finally { console.error = originalConsoleError; }
assert.equal(calls.some(call => call.type === 'run' && call.sql.includes("email_status = 'failed'")), true);

const blocked = await onRequest({
  request: new Request('https://crededu.com/api/enquiries', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
    body: '{}',
  }),
  env: { DB },
  waitUntil() {},
});
assert.equal(blocked.status, 403);

console.log('Enquiry API checks passed.');
