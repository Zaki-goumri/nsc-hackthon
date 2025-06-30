import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlackListService } from './black-list.service';
import { BlackListController } from './black-list.controller';
import { BlackList } from './entities/black-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlackList])],
  controllers: [BlackListController],
  providers: [BlackListService],
  exports: [BlackListService],
})
export class BlackListModule {}
