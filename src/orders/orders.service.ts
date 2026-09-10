import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    private dataSource: DataSource,
  ) { }

  async create(CreateOrderDto: CreateOrderDto, user: JwtPayload) {
    return await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: {
          id:
            CreateOrderDto.productId
        },
        relations: { user: true },
      });
      if (!product) {
        throw new NotFoundException(`Produk dengan ID ${CreateOrderDto.productId} tidak ditemukan!`);
      }
      if (product.user?.id === user.sub) {
        throw new BadRequestException('Anda tidak dapat membeli produk dari toko Anda sendiri!');
      }
      const updateResult = await manager.createQueryBuilder().update(Product).set({ quantity: () => `quantity -${CreateOrderDto.quantity}` })
        .where('id = :id AND quantity >= :quantity', {
          id: product.id,
          quantity: CreateOrderDto.quantity,
        })
        .execute();

      if (updateResult.affected === 0) {
        throw new BadRequestException('Stok produk tidak mencukupi atau barang baru saja habis!');
      }

      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
      const orderNumber = `INV-${today}-${randomCode}`;
      const totalPrice = product.price * CreateOrderDto.quantity;
      const newOrder = manager.create(Order, {
        orderNumber: orderNumber,
        quantity: CreateOrderDto.quantity,
        unitPrice: product.price,
        totalPrice: totalPrice,
        status: 'PAID',
        user: { id: user.sub },
        product: { id: product.id },
      });
      await manager.save(Order, newOrder);
      return {
        message: 'Transaksi berhasil! Pesanan anda telah dibuat',
        data: {
          orderNumber: newOrder.orderNumber,
          orderId: newOrder.id,
          productName: product.name,
          unitPrice: newOrder.unitPrice,
          quantity: newOrder.quantity,
          totalPrice: newOrder.totalPrice,
          status: newOrder.status,
          remainingStock: product.quantity - CreateOrderDto.quantity,
        },
      };
    });
  }
  async findByOrderNumber(orderNumber: string, user: JwtPayload) {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: {
        product: true,
        user: true
      },
    });
    if (!order) {
      throw new NotFoundException(`Pesanan dengan nomor ${orderNumber} tidak ditemukan!`);
    }
    if (order.user.id !== user.sub) {
      throw new ForbiddenException('Akses ditolak!')
    }
    return order;
  }
  async findMyOrders(user: JwtPayload) {
    return await this.orderRepository.find({
      where: { user: { id: user.sub } },
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });
  }
}
