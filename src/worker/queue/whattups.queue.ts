import { WorkerHost, Processor, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOB_NAME } from 'src/common/constants/jobs.name';
import { QUEUE_NAME } from 'src/common/constants/queues.name';
import { Order } from 'src/order/entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { WhattsupService } from 'src/whattsup/whattsup.service';

const message = '';

export interface whattsupMessageProps {
  user: User;
  order: Order;
}

@Processor(QUEUE_NAME.MAIL_QUEUE, { concurrency: 3 })
export class WhattsupQueue extends WorkerHost {
  constructor(private readonly whattsupService: WhattsupService) {
    super();
  }
  logger = new Logger(`${QUEUE_NAME.MAIL_QUEUE}`);
  async process(job: Job<whattsupMessageProps>) {
    switch (job.name) {
      case JOB_NAME.SEND_CONFIRMATION_WHATTSUP:
        return this.sendConfirmatioWhattsupMessage(job.data);
    }
  }

  async sendConfirmatioWhattsupMessage({ user, order }: whattsupMessageProps) {
    await this.whattsupService.sendText(user.phoneNumber, message);
  }
  @OnWorkerEvent('completed')
  onComplete(job: Job) {
    switch (job.name) {
      case JOB_NAME.SEND_CONFIRMATION_WHATTSUP:
        return this.logger.log(`the job with id:${job.id} has been completed`);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    switch (job.name) {
      case JOB_NAME.SEND_CONFIRMATION_WHATTSUP:
        return this.logger.log(
          `the job with id:${job.id} has been faild for ${job.attemptsMade} times`,
        );
    }
  }
}
