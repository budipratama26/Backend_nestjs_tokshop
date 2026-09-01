import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './entities/product.entity.js';

@Injectable()
export class ProductsService {
  private products: Product[] = [];

  create(createProductDto: CreateProductDto) {
    const newProduct: Product = {
      id: Date.now(),
      name: createProductDto.name,
      price: createProductDto.price,
      quantity: createProductDto.quantity,
      description: createProductDto.description,
    };

    this.products.push(newProduct);

    return{
      message: 'Barang telah di tambahkan',
      data: newProduct
    };
  }

  findAll() {
    return this.products;
  }

  findOne(id: number) {
    const product = this.products.find(item => item.id === id);
    if (!product) {
      throw new NotFoundException(`Barang dengan ID ${id} tidak ditemukan!`);
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    const productIndex = this.products.findIndex(item => item.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Barang gagal diubah. ID ${id} tidak ada!`);
    }
    this.products[productIndex] = {
      ...this.products[productIndex],
        ...updateProductDto
    };
    return {
      message: `Barang berhasil diubah!`,
      data: this.products[productIndex]
    };
  }

  remove(id: number) {
    const productIndex = this.products.findIndex(item => item.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Barang gagal dihapus. ID ${id} tidak ada!`);
    }
    this.products.splice(productIndex,1);

    return {message: `Barang dengan ID ${id} berhasil di hapus le!`};
  }
}
