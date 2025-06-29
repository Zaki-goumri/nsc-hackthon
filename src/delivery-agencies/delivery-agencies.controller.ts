import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeliveryAgenciesService } from './delivery-agencies.service';
import { CreateDeliveryAgencyDto } from './dto/create-delivery-agency.dto';
import { UpdateDeliveryAgencyDto } from './dto/update-delivery-agency.dto';

@Controller('delivery-agencies')
export class DeliveryAgenciesController {
  constructor(private readonly deliveryAgenciesService: DeliveryAgenciesService) {}

  @Post()
  create(@Body() createDeliveryAgencyDto: CreateDeliveryAgencyDto) {
    return this.deliveryAgenciesService.create(createDeliveryAgencyDto);
  }

  @Get()
  findAll() {
    return this.deliveryAgenciesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryAgenciesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeliveryAgencyDto: UpdateDeliveryAgencyDto) {
    return this.deliveryAgenciesService.update(+id, updateDeliveryAgencyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryAgenciesService.remove(+id);
  }
}
