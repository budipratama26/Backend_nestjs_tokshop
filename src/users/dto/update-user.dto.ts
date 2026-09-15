import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Budi Niaga Update',
    description: 'Nama lengkap user yang ingin diperbarui',
    required: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong jika diisi!' })
  @IsOptional()
  @MaxLength(100, { message: 'Nama maksimal 100 karakter!' })
  @Matches(/^[^<>]*$/, { message: 'Nama tidak boleh mengandung yang aneh!' })
  name?: string;
}
