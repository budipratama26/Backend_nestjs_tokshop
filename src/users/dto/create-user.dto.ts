import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: `Nama gaboleh kosong!` })
    name: string;

    @IsEmail({}, { message: ` format email gak valid!` })
    email: string;

    @IsString()
    @MinLength(8, {message: `password minimal 8 karakter`})
    password: string;

    @IsOptional()
    @IsString()
    role?: string;
}
