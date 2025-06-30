import { Module } from '@nestjs/common';
import { DeliveryAgenciesService } from './delivery-agencies.service';
import { DeliveryAgenciesController } from './delivery-agencies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAgency } from './entities/delivery-agency.entity';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryAgency]), SearchModule],
  controllers: [DeliveryAgenciesController],
  providers: [DeliveryAgenciesService, DeliveryAgency],
})
export class DeliveryAgenciesModule {}
