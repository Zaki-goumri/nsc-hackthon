import { Module } from '@nestjs/common';
import { PredictionService } from './prediction/prediction.service';
import { PredictionController } from './prediction/prediction.controller';

@Module({
  providers: [PredictionService],
  controllers: [PredictionController]
})
export class AiModule {}
