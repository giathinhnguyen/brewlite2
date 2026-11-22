import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogService } from '../src/services/catalogService.ts';

test('a stalled catalog request times out and a subsequent retry can load products', async () => {
  const originalFetch = globalThis.fetch;
  const originalTimeout = AbortSignal.timeout;
  let watchdog;
  try {
    AbortSignal.timeout = () => originalTimeout(25);
    globalThis.fetch = (_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal.reason), { once: true });
    });
    const request = Promise.race([
      catalogService.getProducts(),
      new Promise((_resolve, reject) => { watchdog = setTimeout(() => reject(new Error('catalog request never settled')), 250); }),
    ]);
    await assert.rejects(request, /quá lâu/);
    clearTimeout(watchdog);
    globalThis.fetch = async () => new Response(JSON.stringify([
      { id: 'product-1', name: 'Coffee', basePrice: '59000', sizes: [{ id: 'size-1', size: 'M', priceAdjustment: '8000' }] },
    ]));
    const products = await catalogService.getProducts();
    assert.equal(products[0].basePrice, 59000);
    assert.equal(products[0].sizes[0].priceAdjustment, 8000);
  } finally {
    clearTimeout(watchdog);
    globalThis.fetch = originalFetch;
    AbortSignal.timeout = originalTimeout;
  }
});
