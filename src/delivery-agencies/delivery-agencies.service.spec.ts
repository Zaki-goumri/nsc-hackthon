import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryAgenciesService } from './delivery-agencies.service';

describe('DeliveryAgenciesService', () => {
  let service: DeliveryAgenciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryAgenciesService],
    }).compile();

    service = module.get<DeliveryAgenciesService>(DeliveryAgenciesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
