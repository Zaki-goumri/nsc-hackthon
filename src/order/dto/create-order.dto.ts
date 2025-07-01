import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { CONTACT_PREF_VALUES, ContactPref } from '../types/contact-pref.type';
import {
  PAYMENT_STATUS_VALUES,
  PaymentStatus,
} from '../types/payment-status.type';
import { ORDER_STATUS_VALUES, OrderStatus } from '../types/order-status.type';
import { RISK_LEVEL_VALUES, RiskLevel } from '../types/risk-level.type';

export class CreateOrderDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  shopId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerAddress: string;

  @ApiProperty({ enum: CONTACT_PREF_VALUES })
  @IsEnum(CONTACT_PREF_VALUES)
  contactPref: ContactPref;

  @ApiProperty()
  deliveryAgencyId: string;

  @ApiProperty({ enum: PAYMENT_STATUS_VALUES })
  @IsEnum(PAYMENT_STATUS_VALUES)
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: ORDER_STATUS_VALUES })
  @IsEnum(ORDER_STATUS_VALUES)
  orderStatus: OrderStatus;

  @ApiProperty({ enum: RISK_LEVEL_VALUES })
  @IsEnum(RISK_LEVEL_VALUES)
  riskLevel: RiskLevel;

  @ApiProperty()
  @IsNumber()
  riskProbability: number;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  deliveryAmount: number;
}
