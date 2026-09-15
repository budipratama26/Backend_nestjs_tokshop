import { IsString, IsNotEmpty, Min, Max, IsInt, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Sepatu Sneakers Nike',
    description: 'Nama barang yang dijual',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @Matches(/^[^<>]*$/, {
    message:
      'Nama barang tidak boleh mengandung tag HTML atau script (< atau >)!',
  })
  @MaxLength(200, { message: 'Nama barang maksimal 200 karakter!' })
  name: string;

  @ApiProperty({ example: 550000, description: 'Harga barang dalam rupiah' })
  @IsInt({ message: 'Harga barang harus berupa bilangan bulat dalam Rupiah' })
  @Min(1000, { message: 'Harga minimal Rp 1.000' })
  @Max(999_999_999, { message: 'Harga maksimal Rp 999.999.999!' })
  price: number;

  @ApiProperty({ example: 50, description: 'Jumlah stok barang' })
  @IsInt({ message: 'Jumlah stok barang harus berupa bilangan bulat' })
  @Min(1, { message: 'Kuatitas tidak boleh minus' })
  @Max(99_999, { message: 'Stok maksimal 99.999 unit!' })
  quantity: number;

  @ApiProperty({
    example: 'Sepatu sneakers original nyaman dipakai',
    description: 'Deskripsi lengkap barang',
  })
  @IsString()
  @Matches(/^[^<>]*$/, {
    message:
      'Deskripsi barang tidak boleh mengandung tag HTML atau script (< atau >)!',
  })
  @MaxLength(2000, { message: 'Deskripsi maksimal 2000 karakter!' })
  description: string;
}
