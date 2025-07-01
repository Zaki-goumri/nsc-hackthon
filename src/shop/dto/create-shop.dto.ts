import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShopDto {
  @ApiProperty({ example: 'Tech Gadgets Store' })
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    example: 'Your one-stop shop for all tech gadgets and accessories',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    example: 'https://example.com/shop-banner.jpg',
    description: 'Shop banner/logo image URL (optional if uploading file)',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
