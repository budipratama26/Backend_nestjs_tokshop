import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Budi Santoso', description: 'Nama lengkap user' })
  @IsString()
  @IsNotEmpty({ message: `Nama gaboleh kosong!` })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter!' })
  @Matches(/^[^<>]*$/, { message: 'Nama tidak boleh mengandung yang aneh!' })
  name: string;

  @ApiProperty({
    example: 'budi@tokshop.com',
    description: 'Alamat email aktif',
  })
  @IsEmail({}, { message: ` format email gak valid!` })
  @MaxLength(255, { message: 'Email maksimal 255 karakter!' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password minimal 8 karakter',
    required: false,
  })
  @IsString()
  @MinLength(8, { message: `password minimal 8 karakter` })
  @MaxLength(72, { message: 'Password maksimal 72 karakter!' })
  password: string;
}
