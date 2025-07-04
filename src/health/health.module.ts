import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from '../redis/redis.service';
import { ElasticsearchHealthIndicator } from './elasticsearch.health';
import { RedisCustomHealthIndicator } from './redis.health';
import { HttpModule } from '@nestjs/axios';
@Module({
  controllers: [HealthController],
  imports: [TerminusModule, TypeOrmModule, HttpModule],
  providers: [HealthService, TypeOrmHealthIndicator, RedisService, ElasticsearchHealthIndicator, RedisCustomHealthIndicator],
})
export class HealthModule {}
