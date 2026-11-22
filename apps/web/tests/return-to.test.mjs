import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeReturnTo } from '../src/lib/returnTo.ts';

test('login preserves an internal invoice destination including payment query and hash', () => {
  assert.equal(safeReturnTo('/orders/order-1?method=zalopay#receipt'), '/orders/order-1?method=zalopay#receipt');
  assert.equal(safeReturnTo('/cart'), '/cart');
});

test('login rejects external destinations, control characters, backslashes and auth loops', () => {
  for (const next of [null, '', 'https://example.com', '//example.com', '/\\example.com', '/\n/example.com', '/.//example.com', '/%2e//example.com', '/login?next=/checkout', '/login/', '/register', '/register/', 'javascript:alert(1)']) {
    assert.equal(safeReturnTo(next), '/', String(next));
  }
});
