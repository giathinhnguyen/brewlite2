import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { CartsService } from './carts.service.js';

describe('CartsService', () => {
  it('UNIT-T01 calc_cart includes size, toppings and quantity in the selected total', async () => {
    const selected = {
      id: 'selected',
      productId: 'tea',
      product: {
        basePrice: '30000',
        stockQuantity: 10,
        isActive: true,
        category: { isActive: true },
      },
      productSize: { priceAdjustment: '5000', isActive: true },
      toppings: [
        { topping: { price: '4000', isActive: true } },
        { topping: { price: '6000', isActive: true } },
      ],
      quantity: 2,
      isSelected: true,
    };
    const unselected = {
      ...selected,
      id: 'unselected',
      isSelected: false,
      quantity: 1,
    };
    const findMany = vi.fn().mockResolvedValue([selected, unselected]);
    const prisma = { cartItem: { findMany } } as unknown as PrismaService;

    const cart = await new CartsService(prisma).getCart('customer');

    expect(cart.items[0]).toMatchObject({
      id: 'selected',
      unitPrice: 45000,
      totalPrice: 90000,
    });
    expect(cart.totalAmount).toBe(90000);
    expect(cart.totalItems).toBe(3);
  });
});
