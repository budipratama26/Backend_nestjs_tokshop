import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    private dataSource: DataSource,
  ) { }

  async create(CreateOrderDto: CreateOrderDto, user: any) {
    return await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: {
          id:
            CreateOrderDto.productId
        },
      });
      if (!product) {
        throw new NotFoundException(`Produk dengan ID ${CreateOrderDto.productId} tidak ditemukan!`);
      }
      if (product.quantity < CreateOrderDto.quantity) {
        throw new BadRequestException(`Stok tidak mencukupi! Sisa stok saat ini ${product.quantity}`);
      }
      product.quantity -= CreateOrderDto.quantity;
      await manager.save(Product, product);
      const totalPrice = product.price * CreateOrderDto.quantity;
      const newOrder = manager.create(Order, {
        quantity: CreateOrderDto.quantity,
        totalPrice: totalPrice,
        user: { id: user.sub },
        product: { id: product.id },
      });
      await manager.save(Order, newOrder);
      return {
        message: 'Transaksi berhasil! Pesanan anda telah dibuat',
        data: {
          orderId: newOrder.id,
          productName: product.name,
          quantity: newOrder.quantity,
          totalPrice: newOrder.totalPrice, 
          remainingStock: product.quantity,
        },
      };
    });
  }
  async findMyOrders(user: any) {
    return await this.orderRepository.find({
      where: { user: { id: user.sub } },
      relations: { product: true },
    });
  }
}
