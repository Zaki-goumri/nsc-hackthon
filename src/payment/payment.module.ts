import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAME } from 'src/common/constants/queues.name';
import { PaymentTasks } from './payment.tasks';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    BullModule.registerQueue(
      { name: QUEUE_NAME.MAIL_QUEUE },
      { name: QUEUE_NAME.WHATTSUP_QUEUE },
    ),
  ],
  controllers: [PaymentController],
  providers: [PaymentService,PaymentTasks],
})
export class PaymentModule {}
