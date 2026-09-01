import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(1000)
    price: number;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsString()
    description: string;
}
