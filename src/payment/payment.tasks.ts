import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentService } from './payment.service';

@Injectable()
export class PaymentTasks {
  constructor(private readonly paymentService: PaymentService) {}


  @Cron(CronExpression.EVERY_HOUR)
  async releaseEscrowCron() {
    await this.paymentService.releaseEscrow();
  }
}
