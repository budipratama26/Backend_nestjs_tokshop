import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @ApiOperation({ summary: 'Checkout / Beli produk (Customer)' })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.create(createOrderDto, req.user);
  }

  @ApiOperation({ summary: 'Melihat riwayat belanjaan saya' })
  @Get('my-orders')
  findMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.user);
  }
}
