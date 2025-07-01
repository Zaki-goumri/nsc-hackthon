import { Module } from '@nestjs/common';
import { PredictionService } from './prediction/prediction.service';
import { PredictionController } from './prediction/prediction.controller';
import { RiskModule } from './risk/risk.module';

@Module({
  providers: [PredictionService],
  controllers: [PredictionController],
  imports: [RiskModule]
})
export class AiModule {}
