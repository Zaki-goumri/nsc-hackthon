import { Module } from '@nestjs/common';
import { DeliveryAgenciesService } from './delivery-agencies.service';
import { DeliveryAgenciesController } from './delivery-agencies.controller';

@Module({
  controllers: [DeliveryAgenciesController],
  providers: [DeliveryAgenciesService],
})
export class DeliveryAgenciesModule {}
