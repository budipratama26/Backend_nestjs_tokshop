import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './entities/product.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryProductDto } from './dto/query-product.dto.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }
  async create(createProductDto: CreateProductDto, user: JwtPayload) {
    const newProduct =
      this.productRepository.create({ ...createProductDto, user: { id: user.sub }, });
    await
      this.productRepository.save(newProduct);

    return {
      message: 'Barang telah di tambahkan',
      data: newProduct
    };
  }

  async findAll(queryDto?: QueryProductDto) {
    const page = queryDto?.page || 1;
    const limit = queryDto?.limit || 10;
    const search = queryDto?.search;
    const sortBy = queryDto?.sortBy || 'id';
    const order = (queryDto?.order?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';
    const query = this.productRepository.createQueryBuilder('product').leftJoinAndSelect('product.user', 'user');
    if (search) {
      query.where(
        'product.name LIKE :search OR product.description LIKE :search', { search: `%${search}%` },
      );
    }

    query.orderBy(`product.${sortBy}`, order);

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
    const product = await
      this.productRepository.findOne({
        where: { id },
        relations: { user: true },
      });
    if (!product) {
      throw new NotFoundException(`Barang dengan ID ${id} tidak ditemukan`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, user: JwtPayload) {
    const product = await
      this.findOne(id);
    if (product.user?.id !== user.sub) {
      throw new ForbiddenException('Akses ditolak!');
    }
    const updatedProduct = this.productRepository.merge(product, updateProductDto);
    await
      this.productRepository.save(updatedProduct);
    return {
      message: `Barang berhasil diupdate di database!`,
      data: updatedProduct
    };
  }

  async remove(id: number, user: JwtPayload) {
    const product = await
      this.findOne(id);
    if (product.user?.id !== user.sub) {
      throw new ForbiddenException('Akses ditolak!')
    }
    await
      this.productRepository.softDelete(id);

    return {
      message: `Barang dengan ID ${id} berhasil dihapus dari database!`
    };
  }

  async updateImage(id: number, filename: string, user: JwtPayload) {
    const product = await
      this.findOne(id);
    if (product.user?.id !== user.sub) {
      throw new ForbiddenException('Akses ditolak');
    }
    product.image = `/uploads/products/${filename}`;
    await this.productRepository.save(product);
    return {
      message: 'Foto produk berhasil diunggah!',
      imageUrl: product.image,
    };
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
