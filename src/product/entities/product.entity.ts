import { Shop } from 'src/shop/entities/shop.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CATEGORIES_VALUES, ProductCategory } from '../types/category.type';

@Entity()
export class Product {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the product',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Wireless Bluetooth Headphones',
    description: 'The name of the product',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'High-quality wireless headphones with noise cancellation',
    description: 'The description of the product',
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    example: 'electronics',
    description: 'The category of the product',
  })
  @Column({ type: 'enum', enum: CATEGORIES_VALUES })
  category: ProductCategory;

  @ApiProperty({
    example: 99.99,
    description: 'The price of the product',
  })
  @Column('decimal')
  price: number;

  @ApiProperty({
    example: 50,
    description: 'The quantity available in stock',
  })
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ApiProperty({
    example: {
      color: 'Black',
      size: 'Large',
      brand: 'TechBrand',
      warranty: '1 year',
    },
    description: 'Additional metadata for the product',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({
    example: 'https://example.com/product-image.jpg',
    description: 'The URL of the product image',
  })
  @Column({ type: 'text', nullable: true, array: true })
  imageUrls?: string[];

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the shop this product belongs to',
  })
  @Column()
  shopId: string;

  @ApiProperty({
    type: () => Shop,
    description: 'The shop this product belongs to',
  })
  @ManyToOne(() => Shop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date when this product was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date when this product was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
