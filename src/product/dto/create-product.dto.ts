import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsObject,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CATEGORIES_VALUES, ProductCategory } from '../types/category.type';

export class CreateProductDto {
  @ApiProperty({
    example: 'Wireless Bluetooth Headphones',
    description: 'The name of the product',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'High-quality wireless headphones with noise cancellation',
    description: 'The description of the product',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'electronics',
    enum: CATEGORIES_VALUES,
    description: 'The category of the product',
  })
  @IsEnum(CATEGORIES_VALUES)
  @IsNotEmpty()
  category: ProductCategory;

  @ApiProperty({
    example: 99.99,
    description: 'The price of the product',
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'The quantity available in stock',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({
    example: {
      color: 'Black',
      size: 'Large',
      brand: 'TechBrand',
      warranty: '1 year',
    },
    description:
      'Additional metadata for the product (variants, specifications, etc.)',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the shop this product belongs to',
  })
  @IsUUID()
  @IsNotEmpty()
  shopId: string;

  @ApiPropertyOptional({
    example: 'https://example.com/product-image.jpg',
    description: 'The URL of the product image',
  })
  @IsOptional()
  @IsString()
  imageUrls?: string[];
}
