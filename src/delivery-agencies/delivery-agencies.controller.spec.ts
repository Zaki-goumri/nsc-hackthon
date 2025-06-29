import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryAgenciesController } from './delivery-agencies.controller';
import { DeliveryAgenciesService } from './delivery-agencies.service';

describe('DeliveryAgenciesController', () => {
  let controller: DeliveryAgenciesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryAgenciesController],
      providers: [DeliveryAgenciesService],
    }).compile();

    controller = module.get<DeliveryAgenciesController>(DeliveryAgenciesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
