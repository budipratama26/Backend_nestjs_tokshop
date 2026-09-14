import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity.js';

export class CreateOrderResponseDto {
  @ApiProperty({
    example: 'INV-20260914-A1B2C3',
    description: 'Nomor invoice transaksi',
  })
  orderNumber: string;

  @ApiProperty({ example: 1, description: 'ID pesanan' })
  orderId: number;

  @ApiProperty({
    example: 'Sepatu Running',
    description: 'Nama produk yang dibeli',
  })
  productName: string;

  @ApiProperty({ example: 150000, description: 'Harga satuan produk (Rupiah)' })
  unitPrice: number;

  @ApiProperty({ example: 2, description: 'Jumlah kuantitas yang dibeli' })
  quantity: number;

  @ApiProperty({ example: 300000, description: 'Total pembayaran (Rupiah)' })
  totalPrice: number;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PAID,
    description: 'Status pesanan',
  })
  status: OrderStatus;

  @ApiProperty({
    example: 8,
    description: 'Sisa stok produk realtime dari database',
  })
  remainingStock: number;
}
