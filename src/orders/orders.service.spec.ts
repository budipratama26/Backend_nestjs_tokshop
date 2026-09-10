import { describe, it, expect, beforeEach, vi } from "vitest";
import { OrdersService } from './orders.service.js';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from "@nestjs/typeorm";
import { Order } from './entities/order.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { DataSource } from "typeorm";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

describe('OrdersService', () => {
    let service: OrdersService;

    const mockOrderRepository = {
        findOne: vi.fn(),
        find: vi.fn(),
    };

    const mockProductRepository = {};

    const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn(),
    };

    const mockEntityManager = {
        findOne: vi.fn(),
        createQueryBuilder: vi.fn(() => mockQueryBuilder),
        create: vi.fn(),
        save: vi.fn(),
    };

    const mockDataSource = {
        transaction: vi.fn(async (callback) => callback(mockEntityManager)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: mockOrderRepository
                },
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductRepository
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource
                },
            ],
        }).compile();
        service = module.get<OrdersService>(OrdersService);
        vi.clearAllMocks();
    });

    describe('create (Checkout)', () => {
        const buyer: JwtPayload = {
            sub: 2,
            email: 'buyer@tokshop.com',
            role: 'customer'
        };
        
        const createDto = { productId: 1, quantity: 2 };

        it('harus melempar NotFoundException jika produk tidak ditemukan', async () => {
            mockEntityManager.findOne.mockResolvedValue(null);
            await expect(service.create(createDto,buyer)).rejects.toThrow(NotFoundException);
        });

        it('harus melempar BadRequestException jika seller membeli produk dari tokonya sendiri', async () => {
            mockEntityManager.findOne.mockResolvedValue({
                id: 1,
                name: 'Sepatu',
                user: { id: 2 },
            });
            await expect(service.create(createDto, buyer)).rejects.toThrow(BadRequestException);
        });

        it('harus melempar BadRequestException jika stok tidak mencukupi saat atomic update', async () => {
            mockEntityManager.findOne.mockResolvedValue({
                id: 1,
                name: 'Sepatu',
                user: { id: 99 },
            });
            mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });

            await expect(service.create(createDto, buyer)).rejects.toThrow(BadRequestException);
        });

        it('harus berhasil checkout jika data valid dan stok mencukupi', async () => {
            mockEntityManager.findOne.mockResolvedValue({
                id: 1,
                name: 'Sepatu',
                price: 50000,
                quantity: 10,
                user: { id: 99 },
            });

            mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });

            mockEntityManager.create.mockReturnValue({
                orderNumber: 'INV-20260910-TEST1',
                id: 101,
                quantity: 2,
                totalPrice: 1000000,
            });

            mockEntityManager.save.mockResolvedValue({});

            const result = await service.create(createDto, buyer);

            expect(result.data.orderNumber).toBe('INV-20260910-TEST1');

            expect(result.data.remainingStock).toBe(8);
        });
    });

    describe('findByOrderNumber', () => {
        it('harus melempar ForbiddenException jika pembeli lain mencoba mengakses invoice', async () => {
            const otherBuyer: JwtPayload = {
                sub: 5,
                email: 'other@tokshop.com',
                role: 'customer'
            };
            mockOrderRepository.findOne.mockResolvedValue({
                id: 1,
                orderNumber: 'INV-123',
                user: { id: 1 },
            });

            await expect(service.findByOrderNumber('INV-123', otherBuyer)).rejects.toThrow(ForbiddenException);
        });
    });
});
