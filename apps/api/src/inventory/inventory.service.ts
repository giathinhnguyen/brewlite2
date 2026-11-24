import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { DrinkLevel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export const levelPercent: Record<DrinkLevel, number> = {
  ZERO: 0,
  FIFTY: 50,
  HUNDRED: 100,
  ONE_TWENTY: 120,
};
export type InventoryLine = {
  productSizeId: string;
  quantity: number;
  sweetnessLevel?: DrinkLevel;
  iceLevel?: DrinkLevel;
};
export type IngredientUsage = { ingredientId: string; quantity: string };

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async requirements(tx: Prisma.TransactionClient, lines: InventoryLine[]) {
    const sizes = await tx.productSize.findMany({
      where: { id: { in: [...new Set(lines.map((i) => i.productSizeId))] } },
      select: {
        id: true,
        isActive: true,
        product: {
          select: {
            name: true,
            isActive: true,
            category: { select: { isActive: true } },
          },
        },
        customizationPolicies: {
          select: { axis: true, allowedLevels: true },
        },
        ingredients: {
          select: {
            ingredientId: true,
            quantity: true,
            adjustmentGroup: true,
            ingredient: {
              select: {
                isActive: true,
                unitCostVnd: true,
                stock: { select: { onHand: true, reserved: true } },
              },
            },
          },
        },
      },
    });
    const sizeById = new Map(sizes.map((size) => [size.id, size]));
    const usage = new Map<string, Prisma.Decimal>();
    const stocks = new Map<
      string,
      { onHand: Prisma.Decimal; reserved: Prisma.Decimal }
    >();
    let cost = new Prisma.Decimal(0);
    for (const line of lines) {
      const size = sizeById.get(line.productSizeId);
      if (
        !size ||
        !size.isActive ||
        !size.product.isActive ||
        !size.product.category.isActive ||
        !size.ingredients.length
      )
        throw new BadRequestException(
          'Món hoặc size chưa có công thức nguyên liệu hợp lệ',
        );
      if (
        !Number.isSafeInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > 10000
      )
        throw new BadRequestException('Số lượng không hợp lệ');
      const policiesByAxis = new Map(
        size.customizationPolicies.map((item) => [item.axis, item]),
      );
      for (const [axis, value] of [
        ['SUGAR', line.sweetnessLevel ?? 'HUNDRED'],
        ['ICE', line.iceLevel ?? 'HUNDRED'],
      ] as const) {
        const policy = policiesByAxis.get(axis);
        if (!policy || !policy.allowedLevels.includes(levelPercent[value]))
          throw new BadRequestException(
            `Món ${size.product.name} không hỗ trợ mức ${axis === 'SUGAR' ? 'ngọt' : 'đá'} đã chọn`,
          );
      }
      for (const recipe of size.ingredients) {
        if (
          !recipe.ingredient.isActive ||
          !recipe.ingredient.stock ||
          recipe.quantity.lte(0)
        )
          throw new BadRequestException('Nguyên liệu chưa sẵn sàng để bán');
        const quantity = recipe.quantity
          .times(line.quantity)
          .times(
            recipe.adjustmentGroup === 'SUGAR'
              ? levelPercent[line.sweetnessLevel ?? 'HUNDRED']
              : 100,
          )
          .div(100)
          .toDecimalPlaces(3, Prisma.Decimal.ROUND_UP);
        if (quantity.isZero()) continue;
        usage.set(
          recipe.ingredientId,
          (usage.get(recipe.ingredientId) ?? new Prisma.Decimal(0)).plus(
            quantity,
          ),
        );
        stocks.set(recipe.ingredientId, {
          onHand: recipe.ingredient.stock.onHand,
          reserved: recipe.ingredient.stock.reserved,
        });
        cost = cost.plus(quantity.times(recipe.ingredient.unitCostVnd));
      }
    }
    return {
      stocks,
      usage: [...usage]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([ingredientId, quantity]) => ({
          ingredientId,
          quantity: quantity.toFixed(3),
        })),
      cost,
    };
  }

  async assertAvailable(tx: Prisma.TransactionClient, lines: InventoryLine[]) {
    const result = await this.requirements(tx, lines);
    for (const item of result.usage) {
      const stock = result.stocks.get(item.ingredientId);
      if (!stock || stock.onHand.minus(stock.reserved).lt(item.quantity))
        throw new ConflictException(
          'Không đủ nguyên liệu cho các món đã chọn. Vui lòng giảm số lượng',
        );
    }
    return result;
  }

  async availability(
    productSizeId: string,
    sweetnessLevel: DrinkLevel = 'HUNDRED',
    iceLevel: DrinkLevel = 'HUNDRED',
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    try {
      const { usage, stocks } = await this.requirements(tx, [
        { productSizeId, quantity: 1, sweetnessLevel, iceLevel },
      ]);
      let available = 10000;
      for (const item of usage) {
        const stock = stocks.get(item.ingredientId);
        if (!stock) return 0;
        available = Math.min(
          available,
          stock.onHand
            .minus(stock.reserved)
            .div(item.quantity)
            .floor()
            .toNumber(),
        );
      }
      return Math.max(0, available);
    } catch (error) {
      if (error instanceof BadRequestException) return 0;
      throw error;
    }
  }
  async availabilityMany(
    productSizeIds: string[],
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const ids = [...new Set(productSizeIds)];
    if (!ids.length) return new Map<string, number>();

    const sizes = await tx.productSize.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        isActive: true,
        product: {
          select: {
            isActive: true,
            category: { select: { isActive: true } },
          },
        },
        customizationPolicies: {
          select: { axis: true, allowedLevels: true },
        },
        ingredients: {
          select: {
            ingredientId: true,
            quantity: true,
            adjustmentGroup: true,
            ingredient: {
              select: {
                isActive: true,
                stock: { select: { onHand: true, reserved: true } },
              },
            },
          },
        },
      },
    });

    const result = new Map(ids.map((id) => [id, 0]));
    for (const size of sizes) {
      if (
        !size.isActive ||
        !size.product.isActive ||
        !size.product.category.isActive ||
        !size.ingredients.length
      )
        continue;

      const policies = new Map(
        size.customizationPolicies.map((policy) => [policy.axis, policy]),
      );
      if (
        !policies.get('SUGAR')?.allowedLevels.includes(100) ||
        !policies.get('ICE')?.allowedLevels.includes(100)
      )
        continue;

      const usage = new Map<string, Prisma.Decimal>();
      let valid = true;
      for (const recipe of size.ingredients) {
        if (
          !recipe.ingredient.isActive ||
          !recipe.ingredient.stock ||
          recipe.quantity.lte(0)
        ) {
          valid = false;
          break;
        }
        usage.set(
          recipe.ingredientId,
          (usage.get(recipe.ingredientId) ?? new Prisma.Decimal(0)).plus(
            recipe.quantity,
          ),
        );
      }
      if (!valid) continue;

      let available = 10000;
      for (const recipe of size.ingredients) {
        const stock = recipe.ingredient.stock!;
        const quantity = usage.get(recipe.ingredientId)!;
        available = Math.min(
          available,
          stock.onHand.minus(stock.reserved).div(quantity).floor().toNumber(),
        );
      }
      result.set(size.id, Math.max(0, available));
    }
    return result;
  }

  async reserve(
    tx: Prisma.TransactionClient,
    orderId: string,
    lines: InventoryLine[],
  ) {
    const { usage } = await this.requirements(tx, lines);
    // Fixed lock order prevents deadlocks when different products share ingredients.
    for (const item of usage) {
      const changed =
        await tx.$executeRaw`UPDATE ingredient_stocks SET reserved = reserved + ${item.quantity}::numeric, updated_at = NOW()
        WHERE ingredient_id = ${item.ingredientId}::uuid AND on_hand - reserved >= ${item.quantity}::numeric`;
      if (changed !== 1)
        throw new ConflictException(
          'Nguyên liệu vừa hết. Vui lòng kiểm tra lại giỏ hàng',
        );
    }
    await tx.order.update({
      where: { id: orderId },
      data: {
        inventoryStatus: 'RESERVED',
        reservedIngredients: usage,
        inventoryReservedAt: new Date(),
      },
    });
  }

  // A paid order was deducted already: refund restores onHand, never reserved.
  async restoreRefund(tx: Prisma.TransactionClient, orderId: string) {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (order.inventoryStatus === 'RESTORED') return;
    if (
      order.inventoryStatus !== 'DEDUCTED' ||
      !Array.isArray(order.reservedIngredients)
    )
      throw new ConflictException(
        'Thiếu dữ liệu nguyên liệu đã trừ để hoàn đơn.',
      );
    const usage = order.reservedIngredients as IngredientUsage[];
    for (const item of [...usage].sort((a, b) =>
      a.ingredientId.localeCompare(b.ingredientId),
    )) {
      const quantity = new Prisma.Decimal(item.quantity);
      if (!quantity.isFinite() || quantity.lte(0))
        throw new ConflictException('Định lượng hoàn kho không hợp lệ.');
      await tx.ingredientStock.update({
        where: { ingredientId: item.ingredientId },
        data: { onHand: { increment: quantity } },
      });
    }
    await tx.order.update({
      where: { id: orderId },
      data: { inventoryStatus: 'RESTORED' },
    });
  }

  // Caller locks the customer and order first. Snapshot is the sole source after reservation.
  async settle(
    tx: Prisma.TransactionClient,
    orderId: string,
    action: 'DEDUCTED' | 'RELEASED',
  ) {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (order.inventoryStatus !== 'RESERVED') return;
    const usage = order.reservedIngredients as IngredientUsage[];
    if (!Array.isArray(usage))
      throw new ConflictException('Thiếu snapshot nguyên liệu');
    for (const item of [...usage].sort((a, b) =>
      a.ingredientId.localeCompare(b.ingredientId),
    )) {
      const quantity = new Prisma.Decimal(item.quantity);
      const changed = await tx.ingredientStock.updateMany({
        where: {
          ingredientId: item.ingredientId,
          reserved: { gte: quantity },
          onHand: { gte: quantity },
        },
        data: {
          reserved: { decrement: quantity },
          ...(action === 'DEDUCTED' ? { onHand: { decrement: quantity } } : {}),
        },
      });
      if (changed.count !== 1)
        throw new ConflictException(
          'Tồn kho không khớp snapshot, cần đối soát',
        );
    }
    await tx.order.update({
      where: { id: orderId },
      data: {
        inventoryStatus: action,
        ...(action === 'DEDUCTED'
          ? { inventoryDeductedAt: new Date() }
          : { inventoryReleasedAt: new Date() }),
      },
    });
  }
}
