import { BadRequestException, ConflictException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { InventoryService } from '../inventory/inventory.service.js';
import type { PromotionsService } from '../promotions/promotions.service.js';
import { OrdersService } from './orders.service.js';

const orderId = '12345678-1234-4234-8234-123456789abc';

function fixture() {
  const updatedAt = new Date('2026-11-24T00:00:00.000Z');
  const current = { id: orderId, status: 'PENDING_PAYMENT' as OrderStatus, updatedAt };
  const tx = {
    order: {
      findUnique: vi.fn().mockResolvedValue(current),
      update: vi.fn().mockImplementation(async ({ data }: { data: { status: OrderStatus } }) => ({ ...current, ...data })),
      findUniqueOrThrow: vi.fn().mockImplementation(async () => ({ ...current, status: 'PAYMENT_FAILED' })),
    },
  };
  const prisma = {
    $transaction: vi.fn(async (work: (client: typeof tx) => unknown) => work(tx)),
  };
  const service = new OrdersService(
    prisma as unknown as PrismaService,
    {} as InventoryService,
    {} as PromotionsService,
  );
  return { service, current, tx };
}

describe('OrdersService.updateStatus', () => {
  it('updates an order status with the current version', async () => {
    const f = fixture();
    const result = await f.service.updateStatus(orderId, {
      status: 'PAYMENT_FAILED',
      updatedAt: f.current.updatedAt.toISOString(),
    });

    expect(result.status).toBe('PAYMENT_FAILED');
    expect(f.tx.order.update).toHaveBeenCalledWith({
      where: { id: orderId },
      data: { status: 'PAYMENT_FAILED' },
    });
  });

  it('rejects an invalid status and stale update', async () => {
    const invalid = fixture();
    await expect(
      invalid.service.updateStatus(orderId, { status: 'SHIPPED' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    const stale = fixture();
    await expect(
      stale.service.updateStatus(orderId, {
        status: 'PAYMENT_FAILED',
        updatedAt: '2026-11-23T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
