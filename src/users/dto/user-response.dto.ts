import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity.js';

export class UserResponseDto {
  @ApiProperty({ description: 'ID unik user' })
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'Nama lengkap' })
  name: string;

  @ApiProperty({ example: 'john@tokshop.com', description: 'Email user' })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.CUSTOMER,
    description: 'Role user',
  })
  role: UserRole;
}
