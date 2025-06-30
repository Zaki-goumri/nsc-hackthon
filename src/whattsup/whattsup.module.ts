import { Module } from '@nestjs/common';
import { WhattsupService } from './whattsup.service';
import { WhattsupController } from './whattsup.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule], 
  controllers: [WhattsupController],
  providers: [WhattsupService],
  exports:[WhattsupService]
})
export class WhattsupModule {}
