import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { IMail } from 'src/config/interfaces/mail.type';

@Module({})
export class MailModule {
  static forRootAsync(): DynamicModule {
    return {
      module: MailModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'MAIL_CONFIG',
          useFactory: (configService: ConfigService) => {
            return configService.get<IMail>('mail');
          },
          inject: [ConfigService],
        },
        MailService,
      ],
      exports: [MailService],
    };
  }
} 