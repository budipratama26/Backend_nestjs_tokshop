import { IsString, IsNotEmpty, Min, IsInt, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'Sepatu Sneakers Nike', description: 'Nama barang yang dijual' })
    @IsString()
    @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
    @Matches(/^[^<>]*$/, { message: 'Nama barang tidak boleh mengandung tag HTML atau script (< atau >)!' })
    name: string;

    @ApiProperty({ example: 550000, description: 'Harga barang dalam rupiah' })
    @IsInt({ message: 'Harga barang harus berupa bilangan bulat dalam Rupiah' })
    @Min(1000, { message: 'Harga minimal Rp 1.000' })
    price: number;

    @ApiProperty({ example: 50, description: 'Jumlah stok barang' })
    @IsInt({ message: 'Jumlah stok barang harus berupa bilangan bulat' })
    @Min(1, { message: 'Kuatitas tidak boleh minus' })
    quantity: number;

    @ApiProperty({ example: 'Sepatu sneakers original nyaman dipakai', description: 'Deskripsi lengkap barang' })
    @IsString()
    @Matches(/^[^<>]*$/, { message: 'Deskripsi barang tidak boleh mengandung tag HTML atau script (< atau >)!' })
    description: string;
}
