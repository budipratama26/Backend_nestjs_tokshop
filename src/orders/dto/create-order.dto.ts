import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ example: 1, description: 'ID produk yang ingin dibeli' })
    @IsInt({ message: 'Produk ID harus berupa bilangan bulat!' })
    @Min(1, { message: 'Produk ID tidak valid!' })
    productId: number;

    @ApiProperty({ example: 2, description: 'Jumlah barang yang dibeli' })
    @IsInt({ message: 'Jumlah beli harus berupa bilangan bulat!' })
    @Min(1, { message: 'Jumlah beli minimal 1' })
    @Max(100, { message: 'Jumlah beli maksimal 100 per transaksi!' })
    quantity: number;
}
