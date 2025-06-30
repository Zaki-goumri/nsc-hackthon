import { Test, TestingModule } from '@nestjs/testing';
import { WhattsupController } from './whattsup.controller';
import { WhattsupService } from './whattsup.service';

describe('WhattsupController', () => {
  let controller: WhattsupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhattsupController],
      providers: [WhattsupService],
    }).compile();

    controller = module.get<WhattsupController>(WhattsupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
