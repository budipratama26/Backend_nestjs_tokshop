import { IsOptional, IsPositive, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryProductDto {
    @ApiPropertyOptional({ example: 1, description: 'Halaman ke berapa' })
    @IsOptional()
    @Type(() => Number)
    @IsPositive()
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, description: 'Jumlah barang per halaman' })
    @IsOptional()
    @Type(() => Number)
    @IsPositive()
    limit?: number = 10;

    @ApiPropertyOptional({ example: 'nike', description: 'Kata kunci pencarian nama atau deskripsi barang' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: 'price', enum: ['id', 'name', 'price', 'quantity'], description: 'Urutkan berdasarkan kolom' })
    @IsOptional()
    @IsIn(['id', 'name', 'price', 'quantity'], { message: 'sortBy hanya boleh: id, name, price, atau quantity' })
    sortBy?: string = 'id';

    @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'], description: 'Arah urut: ASC (A-Z / Rendah ke Tinggi), DESC (Z-A / Tinggi ke Rendah' })
    @IsOptional()
    @IsIn(['ASC', 'DESC', 'asc', 'desc'], { message: 'order hanya boleh ASC atau DESC' })
    order?: 'ASC' | 'DESC' = 'DESC';
}