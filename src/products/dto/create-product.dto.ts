import { IsString, IsNotEmpty, Min, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'Sepatu Sneakers Nike', description: 'Nama barang yang dijual' })
    @IsString()
    @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
    name: string;

    @ApiProperty({ example: 550000, description: 'Harga barang dalam rupiah' })
    @Min(1000, { message: 'Harga tidak boleh minus' })
    price: number;

    @ApiProperty({ example: 50, description: 'Jumlah stok barang' })
    @IsInt({ message: 'Jumlah stok barang harus berupa bilangan bulat' })
    @Min(1, { message: 'Kuatitas tidak boleh minus' })
    quantity: number;

    @ApiProperty({ example: 'Sepatu senakers original nyaman dipakai', description: 'Deskripsi lengkap barang' })
    @IsString()
    description: string;
}
