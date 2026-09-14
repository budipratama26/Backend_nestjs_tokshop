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

describe('TokSHop API (E2E Workflow)', async () => {
  let app: INestApplication;
  let customerToken: string;
  let testProductId: number;

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

    await app.init();
  });

  afterAll(async () => {
    await app.close();
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
    });
  });
});
