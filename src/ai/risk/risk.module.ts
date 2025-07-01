import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RiskService } from './risk.service';
import { HttpModule } from '@nestjs/axios';
import { RiskController } from './risk.controller';
@Module({
  imports: [HttpModule, ConfigModule],
  providers: [RiskService],
  controllers: [RiskController],
})
export class RiskModule {}
