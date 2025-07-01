import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary/:shopId')
  @ApiOperation({ summary: 'Get analytics summary data for a shop' })
  @ApiParam({ name: 'shopId', type: 'string', description: 'Shop ID' })
  @ApiResponse({
    status: 200,
    description: 'Analytics summary retrieved successfully',
  })
  async getSummary(@Param('shopId', ParseUUIDPipe) shopId: string) {
    return this.analyticsService.summeryData(shopId);
  }

  @Get('order-over-time/:shopId')
  @ApiOperation({ summary: 'Get analytics of orders over time ' })
  @ApiParam({ name: 'shopId', type: 'string', description: 'Shop ID' })
  @ApiResponse({
    status: 200,
    description: 'Analytics summary retrieved successfully',
  })
  async getOrdersOverTime(@Param('shopId', ParseUUIDPipe) shopId: string) {
    return this.analyticsService.getOrdersOverTime(shopId);
  }
}
