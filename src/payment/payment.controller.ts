import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaginationQueryDto } from '../common/dtos/pagination.dto';
import { Response } from 'express';
import { ScheduleModule } from '@nestjs/schedule';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Post('initiate/:orderId')
  @ApiOperation({ summary: 'Create payment record and return payment link' })
  async initiate(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentService.initiatePayment(orderId);
  }

  @Get('fake-checkout/:orderId')
  @ApiOperation({ summary: 'Serve fake payment form to simulate credit card input' })
  async fakeCheckout(@Param('orderId', ParseUUIDPipe) orderId: string, @Res() res: Response) {
    const html = this.paymentService.getFakeCheckoutForm(orderId);
    res.status(HttpStatus.OK).send(html);
  }

  @Post('submit/:orderId')
  @ApiOperation({ summary: 'Submit card number, set status to paid, flag escrowHeld = true' })
  async submitPayment(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() body: { cardNumber: string },
  ) {
    return this.paymentService.submitFakePayment(orderId, body.cardNumber);
  }

  @Get(':orderId/status')
  @ApiOperation({ summary: 'Check payment status (used by FE if needed)' })
  async getStatus(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentService.getPaymentStatus(orderId);
  }

  @Post('release-escrow')
  @ApiOperation({ summary: 'Release payment after 48h if no return (CRON/scheduled)' })
  async releaseEscrow() {
    return this.paymentService.releaseEscrow();
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  async findAll(@Query() pagination: PaginationQueryDto) {
    return this.paymentService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Payment ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentService.findOne(id);
  }
}
