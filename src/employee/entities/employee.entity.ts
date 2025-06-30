import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { User } from '../../user/entities/user.entity';
  import { Shop } from '../../shop/entities/shop.entity';
  
  @Entity()
  export class ShopEmployee {
    @ApiProperty({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'The unique identifier of the shop employee',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ApiProperty({
      type: () => User,
      description: 'The user associated with this shop employee',
    })
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
  
    @ApiProperty({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'The ID of the user associated with this shop employee',
    })
    @Column()
    userId: string;
  
    @ApiProperty({
      type: () => Shop,
      description: 'The shop where this employee works',
    })
    @ManyToOne(() => Shop, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shopId' })
    shop: Shop;
  
    @ApiProperty({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'The ID of the shop where this employee works',
    })
    @Column()
    shopId: string;
  
    @ApiProperty({
      example: '2023-01-01T00:00:00.000Z',
      description: 'The date when this shop employee record was created',
    })
    @CreateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
  
    @ApiProperty({
      example: '2023-01-01T00:00:00.000Z',
      description: 'The date when this shop employee record was last updated',
    })
    @UpdateDateColumn({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
  }