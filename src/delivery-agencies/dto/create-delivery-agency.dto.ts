import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDeliveryAgencyDto {
  @ApiProperty({ description: 'name of the delivery agency' })
  @IsString()
  name: string;
}
