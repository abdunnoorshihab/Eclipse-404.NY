const assert = require('node:assert/strict');
const test = require('node:test');
const handler = require('../api/register');
function response() {
  return {
    statusCode: 200, headers: {}, data: null,
    setHeader(k,v) { this.headers[k] = v; return this; },
    status(v) { this.statusCode = v; return this; },
    json(body) { this.data = body; return this; }
  };
}
test('GET rejected', async () => {
  const res = response();
  await handler({ method: 'GET' }, res);
  assert.equal(res.statusCode, 405);
});
test('no secret fails closed', async () => {
  const res = response();
  await handler({ method: 'POST', body: { name: 'Test User' } }, res);
  assert.equal(res.statusCode, 503);
});
test('invalid input does not submit', async () => {
  process.env.REGISTRATION_HOOK_URL = 'https://script.google.com/macros/s/demo/exec';
  process.env.REGISTRATION_SECRET = 'test-only';
  const res = response();
  await handler({method:'POST',body:{name:'A',consent:false}},res);
  assert.equal(res.statusCode,400);
  delete process.env.REGISTRATION_HOOK_URL;
  delete process.env.REGISTRATION_SECRET;
});
