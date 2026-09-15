import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { AppModule } from '../src/app.module.js';
import request from 'supertest';
import { TransformInterceptor } from '../src/common/transform.interceptor.js';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/users/entities/user.entity.js';
import { Product } from '../src/products/entities/product.entity.js';

describe('TokSHop API (E2E Workflow)', async () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let customerToken: string;
  let testProductId: number;
  let testOrderNumber: string;

  process.env.JWT_SECRET = process.env.JWT_SECRET || 'ci_test_jwt_secret_tokshop_2026_e2e';
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalInterceptors(new TransformInterceptor());

    dataSource = moduleFixture.get<DataSource>(DataSource);

    await dataSource.synchronize(true);

    const userRepo = dataSource.getRepository(User);
    const productRepo = dataSource.getRepository(Product);

    const testSeller = await userRepo.save(
      userRepo.create({
        name: 'Seller E2E',
        email: 'seller_e2e@tokshop.com',
        password: 'password123',
        role: UserRole.SELLER,
      }),
    );
    await productRepo.save(
      productRepo.create({
        name: 'Produk E2E Test',
        price: 50000,
        quantity: 50,
        description: 'Produk untuk testing e2e workflow',
        user: testSeller,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('1. Authentication Flow', () => {
    const randomEmail = `test_${Date.now()}@tokshop.com`;

    it('harus berhasil registrasi customer baru (POST /v1/users)', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .send({
          name: 'Tester E2E',
          email: randomEmail,
          password: 'password123',
        })
        .expect(201);

      expect(response.body.data.data.email).toBe(randomEmail);

      expect(response.body.data.data.role).toBe('customer');
    });
    it('harus berhasil login dan mengembalikan JWT token (POST /v1/auth/login)', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: randomEmail,
          password: 'password123',
        })
        .expect(201);

      expect(response.body.data.access_token).toBeDefined();
      customerToken = response.body.data.access_token;
    });
    it('harus menolak login jika password salah (POST /v1/auth/login)', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: randomEmail,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
  describe('2. Products & Orders Flow', () => {
    it('harus dapat melihat katalog produk publik (GET /v1/products)', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/products')
        .expect(200);

      expect(response.body.data.items).toBeDefined();

      expect(Array.isArray(response.body.data.items)).toBe(true);
      testProductId = response.body.data.items[0].id;
    });
    it('harus menolak checkout jika tidak menyertakan JWT token (POST /v1/orders)', async () => {
      await request(app.getHttpServer())
        .post('/v1/orders')
        .send({
          productId: 1,
          quantity: 1,
        })
        .expect(401);
    });
    it('harus berhasil checkout produk dengan invoice jika token valid (POST /v1/orders)', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProductId,
          quantity: 1,
        })
        .expect(201);

      expect(response.body.data.data.orderNumber).toMatch(/^INV-/);

      expect(response.body.data.data.quantity).toBe(1);
      testOrderNumber = response.body.data.data.orderNumber;
    });
    describe('3. Security, RBAC & Ownership flow', () => {
      it('harus menolak (403) jika customer mengakses endpoint khusus admin (GET /v1/users/:id)', async () => {
        await request(app.getHttpServer())
          .get('/v1/users/1')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);
      });
      it('harus menolak (403) jika customer mencoba membuat produk baru (POST /v1/products)', async () => {
        await request(app.getHttpServer())
          .post('/v1/products')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'Produk Ilegal',
            price: 10000,
            quantity: 5,
            description: 'Hanya seller yang boleh posting',
          })
          .expect(403);
      });
      it('harus menolak (403) jika customer lain mencoba mengintip invoice orang lain (GET /v1/orders/:orderNumber', async () => {
        const otherEmail = `other_${Date.now()}@tokshop.com`;
        await request(app.getHttpServer())
          .post('/v1/users')
          .send({
            name: 'Customer Lain',
            email: otherEmail,
            password: 'password123',
          })
          .expect(201);

        const loginRes = await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({
            email: otherEmail,
            password: 'password123',
          })
          .expect(201);

        const otherToken = loginRes.body.data.access_token;

        await request(app.getHttpServer())
          .get(`/v1/orders/${testOrderNumber}`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(403);
      });
      it('harus berhasil (200) jika customer pemilik sah melihat invoicenya sendiri (GET /v1/orders/:orderNumber)', async () => {
        const response = await request(app.getHttpServer())
          .get(`/v1/orders/${testOrderNumber}`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);
        expect(response.body.data.orderNumber).toBe(testOrderNumber);
      });
      it('harus menolak (401) jika JWT dipakai setelah akun dihapus (DELETE /v1/users/me)', async () => {
        const zombieEmail = `zombie_${Date.now()}@tokshop.com`;
        await request(app.getHttpServer())
          .post('/v1/users')
          .send({
            name: 'Zombie',
            email: zombieEmail,
            password: 'password123'
          })
          .expect(201);

        const loginRes = await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({
            email: zombieEmail,
            password: 'password123'
          })
          .expect(201);

        const zombieToken = loginRes.body.data.access_token;

        await request(app.getHttpServer())
          .delete('/v1/users/me')
          .set('Authorization', `Bearer ${zombieToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get('/v1/users/me')
          .set('Authorization', `Bearer ${zombieToken}`)
          .expect(401);
      });
    });
  });
});
