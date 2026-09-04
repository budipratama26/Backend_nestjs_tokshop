import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './entities/product.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

  private products: Product[] = [];

  async create(createProductDto: CreateProductDto, user: any) {
    const newProduct =
      this.productRepository.create({ ...createProductDto, user: { id: user.sub }, });
    await
      this.productRepository.save(newProduct);

    return {
      message: 'Barang telah di tambahkan',
      data: newProduct
    };
  }

  async findAll() {
    return await this.productRepository.find({
      relations: { user: true, },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        description: true,
        user: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    });
  }

  async findOne(id: number) {
    const product = await
      this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Barang dengan ID ${id} tidak ditemukan`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await
      this.findOne(id);
    const updatedProduct = this.productRepository.merge(product, updateProductDto);
    await
      this.productRepository.save(updatedProduct);
    return {
      message: `Barang berhasil diupdate di database!`,
      data: updatedProduct
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await
      this.productRepository.delete(id);

    return {
      message: `Barang dengan ID ${id} berhasil dihapus dari database!`
    };
  }
}
