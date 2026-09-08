import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'budi@tokshop.com', description: 'Email akun terdaftar' })
    @IsEmail({}, { message: `format email tidak valid!` })
    email: string;

    @ApiProperty({ example: 'password123', description: 'Password akun' })
    @IsString()
    @IsNotEmpty({ message: `Password tidak boleh kosong!` })
    password: string;
}