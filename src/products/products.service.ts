import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './entities/product.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryProductDto } from './dto/query-product.dto.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { join } from 'node:path';
import * as fs from 'node:fs';
import { AuditLogService } from '../common/audit-log.service.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private auditLogService: AuditLogService,
  ) { }
  async create(createProductDto: CreateProductDto, user: JwtPayload) {
    const newProduct = this.productRepository.create({
      ...createProductDto,
      user: { id: user.sub },
    });
    await this.productRepository.save(newProduct);

    await this.auditLogService.log({
      action: 'PRODUCT_CREATED',
      userId: user.sub,
      targetId: String(newProduct.id),
      targetType: 'Product',
      details: { name: createProductDto.name },
    });

    return {
      message: 'Barang telah di tambahkan',
      data: newProduct,
    };
  }

  async findAll(queryDto?: QueryProductDto) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const search = queryDto?.search;
    const sortBy = queryDto?.sortBy || 'id';
    const order = (queryDto?.order?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';
    const allowedSortColumns = ['id', 'name', 'price', 'quantity'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.user', 'user')
      .addSelect(['user.id', 'user.name']);
    if (search) {
      query.where(
        'product.name LIKE :search OR product.description LIKE :search',
        { search: `%${search}%` },
      );
    }

    query.orderBy(`product.${safeSortBy}`, order);

    query.skip((page - 1) * limit).take(limit);
    const [products, total] = await query.getManyAndCount();
    return {
      items: products,
      meta: {
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { user: true },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        image: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Barang dengan ID ${id} tidak ditemukan`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user: JwtPayload,
  ) {
    const product = await this.findOne(id);
    if (product.user?.id !== user.sub) {
      throw new ForbiddenException('Akses ditolak!');
    }
    const updatedProduct = this.productRepository.merge(
      product,
      updateProductDto,
    );
    await this.productRepository.save(updatedProduct);
    return {
      message: `Barang berhasil diupdate di database!`,
      data: updatedProduct,
    };
  }

  async remove(id: number, user: JwtPayload) {
    const product = await this.findOne(id);
    if (product.user?.id !== user.sub) {
      throw new ForbiddenException('Akses ditolak!');
    }
    await this.productRepository.softDelete(id);

    await this.auditLogService.log({
      action: 'PRODUCT_DELETED',
      userId: user.sub,
      targetId: String(id),
      targetType: 'Product',
    });

    return {
      message: `Barang dengan ID ${id} berhasil dihapus dari database!`,
    };
  }

  async updateImage(id: number, filename: string, user: JwtPayload) {
    const newFilePath = join(process.cwd(), 'uploads/products', filename);
    try {
      const product = await this.findOne(id);
      if (product.user?.id !== user.sub) {
        throw new ForbiddenException('Akses ditolak');
      }
      if (product.image) {
        const oldFilePath = join(process.cwd(), product.image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      product.image = `/uploads/products/${filename}`;
      await this.productRepository.save(product);

      return {
        message: 'Foto produk berhasil diunggah!',
        imageUrl: product.image,
      };
    } catch (error) {
      if (fs.existsSync(newFilePath)) {
        fs.unlinkSync(newFilePath);
      }
      throw error;
    }
  }
  async restore(id: number, user: JwtPayload) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { user: true },
      withDeleted: true,
    });
    if (!product) {
      throw new NotFoundException(`Barang dengan ID ${id} tidak ditemukan`);
    }
    if (product.user?.id !== user.sub) {
      throw new ForbiddenException('Akses ditolak');
    }
    await this.productRepository.restore(id);
    return {
      message: `Barang dengan ID ${id} berhasil dipulihkan kembali ke toko!`,
    };
  }
}
