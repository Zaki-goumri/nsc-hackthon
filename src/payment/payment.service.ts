import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '../common/dtos/pagination.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_NAME } from 'src/common/constants/queues.name';
import { MailQueue } from 'src/worker/queue/mail.queue';
import { WhattsupQueue } from 'src/worker/queue/whattups.queue';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectQueue(QUEUE_NAME.MAIL_QUEUE) mailQueue: MailQueue,
    @InjectQueue(QUEUE_NAME.WHATTSUP_QUEUE) WhattsupQueue: WhattsupQueue,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(createPaymentDto);
    const savedPayment = await this.paymentRepository.save(payment);
    return savedPayment;
  }

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Payment>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await this.paymentRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  private async selectQueue(userContact: string): Promise<void> {}

  async initiatePayment(
    orderId: string,
  ): Promise<{ paymentId: string; paymentLink: string }> {
    const payment = this.paymentRepository.create({
      orderId,
      status: 'pending',
      cardLast4: '0000',
      escrowHeld: false,
    });
    const saved = await this.paymentRepository.save(payment);
    return {
      paymentId: saved.id,
      paymentLink: `/payments/fake-checkout/${orderId}`,
    };
  }

  getFakeCheckoutForm(orderId: string): string {
    return `
      <html>
        <body>
          <h2>Fake Payment for Order ${orderId}</h2>
          <form method="POST" action="/payments/submit/${orderId}">
            <label>Card Number:</label>
            <input type="text" name="cardNumber" maxlength="16" required />
            <button type="submit">Pay</button>
          </form>
        </body>
      </html>
    `;
  }

  async submitFakePayment(orderId: string, cardNumber: string): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
    });
    if (!payment) throw new Error('Payment not found');
    payment.status = 'paid';
    payment.escrowHeld = true;
    payment.cardLast4 = cardNumber.slice(-4);
    await this.paymentRepository.save(payment);
    return { message: 'Payment successful', paymentId: payment.id };
  }

  async getPaymentStatus(
    orderId: string,
  ): Promise<{ status: string; escrowHeld: boolean }> {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
    });
    if (!payment) throw new Error('Payment not found');
    return { status: payment.status, escrowHeld: payment.escrowHeld };
  }

  async releaseEscrow(): Promise<{ released: number }> {
    const payments = await this.paymentRepository.find({
      where: { escrowHeld: true, releasedToSellerAmount: IsNull() },
    });
    let releasedCount = 0;
    for (const payment of payments) {
      payment.escrowHeld = false;
      payment.releasedToSellerAmount = payment.amount;
      payment.releasedAt = new Date();
      await this.paymentRepository.save(payment);
      releasedCount++;
    }
    return { released: releasedCount };
  }
}
