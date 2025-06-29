import { Module } from '@nestjs/common';
import { BlackListService } from './black-list.service';
import { BlackListController } from './black-list.controller';

@Module({
  controllers: [BlackListController],
  providers: [BlackListService],
})
export class BlackListModule {}
