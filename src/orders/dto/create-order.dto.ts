import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ example: 1, description: 'ID produk yang ingin dibeli' })
    @IsNumber({}, { message: 'Produk ID harus berupa angka!' })
    productId: number;

    @ApiProperty({ example: 2, description: 'Jumlah barang yang dibeli' })
    @IsNumber({}, { message: 'Jumlah beli harus berupa angka!' })
    @Min(1, { message: 'Jumlah beli minimal 1' })
    quantity: number;
}
