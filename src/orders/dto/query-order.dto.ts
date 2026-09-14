import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryOrderDto {
  @ApiPropertyOptional({ example: 1, description: 'halaman ke berapa' })
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'halaman minimal 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Jumlah pesanan per halaman',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Jumlah (limit) harus berupa bilangan bulat' })
  @Min(1, { message: 'Limit minimal 1' })
  @Max(100, { message: 'Limit maksimal 100 per halaman' })
  limit?: number = 10;
}
