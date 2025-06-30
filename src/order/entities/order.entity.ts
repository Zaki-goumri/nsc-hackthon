import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import { User } from 'src/user/entities/user.entity';
import { DeliveryAgency } from 'src/delivery-agencies/entities/delivery-agency.entity';
import { CONTACT_PREFS, ContactPref } from '../types/contact-pref.type';
import { PAYMENT_STATUSES, PaymentStatus } from '../types/payment-status.type';
import { ORDER_STATUSES, OrderStatus } from '../types/order-status.type';
import { RISK_LEVELS, RiskLevel } from '../types/risk-level.type';

@Entity()
export class Order {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: 'b7e6c1a2-3f4d-4e2a-9c1b-2e4f5a6b7c8d',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the product being ordered',
    example: 'prod-12345',
  })
  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({
    description: 'ID of the shop where the order was placed',
    example: 'shop-67890',
  })
  @Column()
  shopId: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @ApiProperty({
    description: 'ID of the user who created the order',
    example: 'user-abcde',
  })
  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ApiProperty({
    description: 'Name of the customer placing the order',
    example: 'John Doe',
  })
  @Column()
  customerName: string;

  @ApiProperty({
    description: 'Phone number of the customer',
    example: '+1234567890',
  })
  @Column()
  customerPhone: string;

  @ApiProperty({
    description: 'Address of the customer',
    example: '123 Main St, Springfield',
  })
  @Column()
  customerAddress: string;

  @ApiProperty({
    description: 'Preferred contact method for the customer',
    enum: CONTACT_PREFS,
    example: 'whatsapp',
  })
  @Column({ type: 'enum', enum: CONTACT_PREFS })
  contactPref: ContactPref;

  @ApiProperty({
    description: 'ID of the delivery agency handling the order',
    example: 'agency-xyz12',
  })
  @Column()
  deliveryAgencyId: string;

  @ManyToOne(() => DeliveryAgency)
  @JoinColumn({ name: 'deliveryAgencyId' })
  deliveryAgency: DeliveryAgency;

  @ApiProperty({
    description: 'Payment status of the order',
    enum: PAYMENT_STATUSES,
    example: 'pending',
  })
  @Column({ type: 'enum', enum: PAYMENT_STATUSES })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Current status of the order',
    enum: ORDER_STATUSES,
    example: 'new',
  })
  @Column({ type: 'enum', enum: ORDER_STATUSES })
  orderStatus: OrderStatus;

  @ApiProperty({
    description: 'Risk level associated with the order',
    enum: RISK_LEVELS,
    example: 'low',
  })
  @Column({ type: 'enum', enum: RISK_LEVELS })
  riskLevel: RiskLevel;

  @ApiProperty({
    description: 'Probability (0-1) that the order is risky',
    example: 0.15,
  })
  @Column('float')
  riskProbability: number;

  @ApiProperty({
    description: 'Date and time when the order was created',
    example: '2024-06-01T12:34:56.789Z',
  })
  @CreateDateColumn()
  createdAt: Date;
}

