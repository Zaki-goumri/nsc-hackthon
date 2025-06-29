import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryAgencyDto } from './create-delivery-agency.dto';

export class UpdateDeliveryAgencyDto extends PartialType(CreateDeliveryAgencyDto) {}
