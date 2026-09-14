import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { CreateOrderResponseDto } from './dto/order-response.dto.js';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Checkout / Beli produk (Customer)' })
  @Post()
  @ApiResponse({
    status: 201,
    type: CreateOrderResponseDto,
    description: 'Transaksi berhasil dibuat',
  })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @ApiOperation({ summary: 'Melihat riwayat belanjaan saya' })
  @Get('my-orders')
  findMyOrders(@CurrentUser() user: JwtPayload, @Query() query: QueryOrderDto) {
    return this.ordersService.findMyOrders(user, query);
  }
  @ApiOperation({ summary: 'Melihat detail pesanan berdasarkan Nomor Invoice' })
  @Get(':orderNumber')
  findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.findByOrderNumber(orderNumber, user);
  }
}
