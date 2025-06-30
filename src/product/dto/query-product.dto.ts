import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { CATEGORIES_VALUES, ProductCategory } from '../types/category.type';

export class QueryProductDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter products by shop ID',
  })
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({
    example: 'headphones',
    description: 'Search products by name or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'electronics',
    enum: CATEGORIES_VALUES,
    description: 'Filter products by category',
  })
  @IsOptional()
  @IsEnum(CATEGORIES_VALUES)
  category?: ProductCategory;
} 