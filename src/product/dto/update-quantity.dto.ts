import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateQuantityDto {
  @ApiProperty({
    example: 50,
    description: 'The new quantity for the product',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @Type(() => Number)
  quantity: number;
} 