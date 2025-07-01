import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsEnum, IsString, IsBoolean, IsOptional, Min, Length } from 'class-validator';
import { PAYMENT_STATUS_VALUES, PaymentStatus } from '../../order/types/payment-status.type';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PAYMENT_STATUS_VALUES })
  @IsEnum(PAYMENT_STATUS_VALUES)
  status: PaymentStatus;

  @ApiProperty()
  @IsString()
  @Length(4, 4)
  cardLast4: string;

  @ApiProperty()
  @IsBoolean()
  escrowHeld: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  refundAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  releasedToSellerAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  releasedAt?: Date;
}
