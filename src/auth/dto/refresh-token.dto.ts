import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {
    @ApiProperty({ example: 'd4f8a1b2c3...', description: 'Refresh token hex string yang didapat saat login', })
    @IsString()
    @IsNotEmpty({ message: 'Refresh token tidak boleh kosong!' })
    refreshToken: string;
}