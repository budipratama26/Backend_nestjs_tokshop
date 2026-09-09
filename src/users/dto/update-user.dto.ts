import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({
        example: 'Budi Niaga Update',
        description: 'Nama lengkap user yang ingin diperbarui',
        required: false
    })
    @IsString()
    @IsNotEmpty({message:'Nama tidak boleh kosong jika diisi!'})
    @IsOptional()
    name?: string;
}
