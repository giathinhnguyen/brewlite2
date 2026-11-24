import { type INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthController } from '../src/auth/auth.controller.js';
import { AuthService } from '../src/auth/auth.service.js';
import { EmailVerificationService } from '../src/auth/email-verification.service.js';
import { PasswordSetupService } from '../src/auth/password-setup.service.js';
import { InventoryService } from '../src/inventory/inventory.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { ProductsController } from '../src/products/products.controller.js';
import { ProductsService } from '../src/products/products.service.js';
import { ToppingsController } from '../src/toppings/toppings.controller.js';
import { ToppingsService } from '../src/toppings/toppings.service.js';
import { verificationFixture } from './verification-fixture.js';

describe('Traceability matrix API scenarios', () => {
  let app: INestApplication;
  const auth = verificationFixture();
  const credentials = {
    email: 'traceability@example.com',
    password: 'test-password123',
  };
  const size = { id: 'size-m', size: 'M', priceAdjustment: 5000 };
  const product = {
    id: 'tea',
    name: 'Milk tea',
    basePrice: 30000,
    category: { id: 'tea-category', name: 'Tea', slug: 'tea' },
    sizes: [size],
  };
  const topping = { id: 'pearls', name: 'Pearls', price: 4000 };
  const findMany = vi.fn().mockResolvedValue([product]);
  const findFirst = vi
    .fn()
    .mockResolvedValueOnce(product)
    .mockResolvedValue(null);
  const database = {
    ...auth.prisma,
    product: { findMany, findFirst },
    topping: { findMany: vi.fn().mockResolvedValue([topping]) },
    customizationPolicy: { findMany: vi.fn().mockResolvedValue([]) },
  };
  const inventory = {
    availability: vi.fn().mockResolvedValue(8),
    availabilityMany: vi.fn().mockResolvedValue(new Map([['size-m', 8]])),
  };

  beforeAll(async () => {
    const registration = await auth.service.register({
      ...credentials,
      fullName: 'Traceability tester',
      confirmPassword: credentials.password,
    });
    await auth.verification.verify({
      registrationId: registration.registrationId,
      code: auth.code(),
    });
    const module = await Test.createTestingModule({
      controllers: [ProductsController, ToppingsController, AuthController],
      providers: [
        { provide: PrismaService, useValue: database },
        { provide: InventoryService, useValue: inventory },
        {
          provide: ProductsService,
          useValue: new ProductsService(
            database as unknown as PrismaService,
            inventory as unknown as InventoryService,
          ),
        },
        {
          provide: ToppingsService,
          useValue: new ToppingsService(database as unknown as PrismaService),
        },
        { provide: AuthService, useValue: auth.service },
        { provide: EmailVerificationService, useValue: auth.verification },
        { provide: PasswordSetupService, useValue: {} },
        { provide: JwtService, useValue: auth.jwt },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('API-T01 get_products returns the active menu with size availability', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);
    expect(response.body).toEqual([
      {
        ...product,
        sizes: [{ ...size, stockQuantity: 8, customizationPolicies: [] }],
        stockQuantity: 8,
      },
    ]);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, category: { isActive: true } },
      }),
    );
  });

  it('API-T02 get_detail returns the requested product, its sizes and separately listed toppings', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products/tea')
      .expect(200);
    expect(response.body).toMatchObject({
      id: product.id,
      sizes: [{ ...size, stockQuantity: 8 }],
    });
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: product.id, isActive: true, category: { isActive: true } },
      }),
    );
    const toppings = await request(app.getHttpServer())
      .get('/api/toppings')
      .expect(200);
    expect(toppings.body).toEqual([topping]);
    await request(app.getHttpServer()).get('/api/products/missing').expect(404);
  });

  it('API-T03 auth_jwt accepts a valid login and rejects a wrong password', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(credentials)
      .expect(201);
    const profile = await request(app.getHttpServer())
      .get('/api/auth/me')
      .auth(response.body.accessToken, { type: 'bearer' })
      .expect(200);
    expect(profile.body).toMatchObject({ email: credentials.email });
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ ...credentials, password: 'wrong-password123' })
      .expect(401);
  });
});
