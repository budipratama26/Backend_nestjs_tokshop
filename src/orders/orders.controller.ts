import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @ApiOperation({ summary: 'Checkout / Beli produk (Customer)' })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    return this.ordersService.create(createOrderDto, user);
  }

  @ApiOperation({ summary: 'Melihat riwayat belanjaan saya' })
  @Get('my-orders')
  findMyOrders(@CurrentUser() user: JwtPayload) {
    return this.ordersService.findMyOrders(user);
  }
  @ApiOperation({ summary: 'Melihat detail pesanan berdasarkan Nomor Invoice' })
  @Get(':orderNumber')

  findByOrderNumber(@Param('orderNumber') orderNumber: string, @CurrentUser() user: JwtPayload) {
    return this.ordersService.findByOrderNumber(orderNumber, user);
  }
}
