import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_STATUS_VALUES, PaymentStatus } from '../../order/types/payment-status.type';

@Entity()
export class Payment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  orderId: string;

  @ApiProperty()
  @Column('numeric')
  amount: number;

  @ApiProperty({ enum: PAYMENT_STATUS_VALUES })
  @Column({ type: 'enum', enum: PAYMENT_STATUS_VALUES })
  status: PaymentStatus;

  @ApiProperty()
  @Column()
  cardLast4: string;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  escrowHeld: boolean;

  @ApiProperty({ required: false })
  @Column('numeric', { nullable: true })
  refundAmount?: number;

  @ApiProperty({ required: false })
  @Column('numeric', { nullable: true })
  releasedToSellerAmount?: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  releasedAt?: Date;
}
