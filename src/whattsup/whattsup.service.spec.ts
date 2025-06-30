import { Test, TestingModule } from '@nestjs/testing';
import { WhattsupService } from './whattsup.service';

describe('WhattsupService', () => {
  let service: WhattsupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhattsupService],
    }).compile();

    service = module.get<WhattsupService>(WhattsupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
