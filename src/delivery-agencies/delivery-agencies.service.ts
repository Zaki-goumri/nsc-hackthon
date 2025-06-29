import { Injectable } from '@nestjs/common';
import { CreateDeliveryAgencyDto } from './dto/create-delivery-agency.dto';
import { UpdateDeliveryAgencyDto } from './dto/update-delivery-agency.dto';

@Injectable()
export class DeliveryAgenciesService {
  create(createDeliveryAgencyDto: CreateDeliveryAgencyDto) {
    return 'This action adds a new deliveryAgency';
  }

  findAll() {
    return `This action returns all deliveryAgencies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deliveryAgency`;
  }

  update(id: number, updateDeliveryAgencyDto: UpdateDeliveryAgencyDto) {
    return `This action updates a #${id} deliveryAgency`;
  }

  remove(id: number) {
    return `This action removes a #${id} deliveryAgency`;
  }
}
