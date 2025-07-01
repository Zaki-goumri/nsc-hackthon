import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { RiskService } from './risk.service';

class RiskTestDto {
  name: string;
  product_category: string;
}

@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Post('test')
  @ApiOperation({ summary: 'Test AI risk analysis' })
  @ApiBody({ type: RiskTestDto })
  async testRisk(@Body() body: RiskTestDto) {
    return this.riskService.analyzeRisk(body.name, body.product_category);
  }
}

