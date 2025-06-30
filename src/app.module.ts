import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/appConfig';
import { Idb } from './config/interfaces/db.type';
import { DataSource } from 'typeorm';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { IJwt } from './config/interfaces/jwt.type';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { IRedis } from './config/interfaces/redis.interface';
import { QUEUE_NAME } from './common/constants/queues.name';
import { MailQueue } from './worker/queue/mail.queue';
import { MailQueueEventListener } from './worker/event/mail.queue.event';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { MailModule } from './mail/mail.module';
import { HealthModule } from './health/health.module';
import { SearchModule } from './search/search.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ShopModule } from './shop/shop.module';
import { EmployeeModule } from './employee/employee.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { DeliveryAgenciesModule } from './delivery-agencies/delivery-agencies.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RefundsModule } from './refunds/refunds.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BlackListModule } from './black-list/black-list.module';
import { WhattsupModule } from './whattsup/whattsup.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    UserModule,
    MailModule.forRootAsync(),
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<Idb>('db');
        return {
          ...dbConfig,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get<IRedis>('redis');
        return {
          connection: { ...redisConfig },
          defaultJobOptions: {
            attempts: 3,
            backoff: 5000,
            removeOnComplete: 3000,
            removeOnFail: 1000,
          },
        };
      },
    }),
    BullModule.registerQueue(
      ...Object.values(QUEUE_NAME).map((queueName) => ({
        name: queueName,
      })),
    ),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 5000,
          limit: 5,
        },
        {
          name: 'medium',
          ttl: 1000 * 30,
          limit: 10,
        },
        {
          name: 'long',
          ttl: 1000 * 60,
          limit: 25,
        },
      ],
      storage: new ThrottlerStorageRedisService({
        host: 'redis',
        port: 6379,
      }),
    }),
    RedisModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<IJwt>('secret');
        return {
          secret: jwtConfig?.secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
    HealthModule,
    SearchModule,
    SupabaseModule,
    ShopModule,
    EmployeeModule,
    ProductModule,
    OrderModule,
    PaymentModule,
    DeliveryAgenciesModule,
    NotificationsModule,
    RefundsModule,
    AiModule,
    AnalyticsModule,
    BlackListModule,
    WhattsupModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailQueue,
    MailQueueEventListener,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
