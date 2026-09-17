import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'budi@tokshop.com',
    description: 'Email akun terdaftar',
  })
  @IsEmail({}, { message: `format email tidak valid!` })
  @MaxLength(255, { message: 'Email maksimal 255 karakter!' })
  email: string;

  @ApiProperty({ example: 'Password123', description: 'Password akun' })
  @IsString()
  @IsNotEmpty({ message: `Password tidak boleh kosong!` })
  @MaxLength(72, { message: 'Password maksimal 72 karakter!' })
  password: string;
}
