import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'Budi Santoso', description: 'Nama lengkap user' })
    @IsString()
    @IsNotEmpty({ message: `Nama gaboleh kosong!` })
    name: string;

    @ApiProperty({ example: 'budi@tokshop.com', description: 'Alamat email aktif' })
    @IsEmail({}, { message: ` format email gak valid!` })
    email: string;

    @ApiProperty({ example: 'password123', description: 'Password minimal 8 karakter', required: false })
    @IsString()
    @MinLength(8, { message: `password minimal 8 karakter` })
    password: string;
}
