import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';

describe('ProductsService', () => {
  let service: ProductsService;

  let mockRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOneBy: vi.fn(),
    findOne: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    createQueryBuilder: vi.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should create a product', async () => {
      const createDto: CreateProductDto = { name: 'Test Product', price: 10000, quantity: 5, description: 'Test description' };
      const user = { sub: 1 };
      const expectedProduct = { id: 1, ...createDto, user: { id: 1 } };
      mockRepository.create.mockReturnValue(expectedProduct);
      mockRepository.save.mockResolvedValue(expectedProduct);

      const result = await service.create(createDto, user);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        user: { id: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Barang telah di tambahkan', data:expectedProduct});
    });
  });
  describe('findOne', () => {
    it('should return a product if found', async () => {
      const product = { id: 1, name: 'Test', price: 5000 };
      mockRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(1);
      expect(result).toEqual(product);
    });
    it('should throw NotFoundException if product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow();
    });
  });
});
