import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationQueryDto } from '../common/dtos/pagination.dto';
import { ORDER_STATUS_VALUES, OrderStatus } from './types/order-status.type';
import { RISK_LEVEL_VALUES, RiskLevel } from './types/risk-level.type';
import { InventoryQueryDto } from './dto/inventory-query.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('inventory')
  @ApiOperation({ summary: 'Get product inventory for orders' })
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
  @ApiQuery({
    name: 'shopId',
    required: false,
    type: String,
    description: 'Filter by shop ID',
  })
  async getProductInventory(@Query() query: InventoryQueryDto) {
    const { page, limit, shopId } = query;
    return this.orderService.getProductInventory({ page, limit }, shopId);
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated orders' })
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
  @ApiQuery({
    name: 'shopId',
    required: false,
    type: String,
    description: 'Filter by shop ID',
  })
  async getPaginatedOrders(
    @Query() pagination: PaginationQueryDto,
    @Query('shopId') shopId: string,
  ) {
    return this.orderService.getPaginatedOrders(pagination, shopId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.create(createOrderDto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Customer confirms the order via WhatsApp/email' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  async confirmOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.confirmOrder(id);
  }

  @Get()
  @ApiOperation({
    summary: 'List/search orders (all shops) with pagination and filters',
  })
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
  @ApiQuery({
    name: 'shopId',
    required: false,
    type: String,
    description: 'Filter by shop ID',
  })
  @ApiQuery({
    name: 'orderStatus',
    required: false,
    enum: ORDER_STATUS_VALUES,
    description: 'Filter by order status',
  })
  @ApiQuery({
    name: 'riskLevel',
    required: false,
    enum: RISK_LEVEL_VALUES,
    description: 'Filter by risk level',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by customer name, phone, or address',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('shopId') shopId?: string,
    @Query('orderStatus') orderStatus?: OrderStatus,
    @Query('riskLevel') riskLevel?: RiskLevel,
    @Query('search') search?: string,
  ) {
    return await this.orderService.findAll(paginationQuery, {
      shopId,
      orderStatus,
      riskLevel,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one order by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  async findOne(@Param('id') id: string) {
    return await this.orderService.findOne(id);
  }

  @Patch(':id/delivered')
  @ApiOperation({
    summary: 'Seller marks item as delivered (starts 48h escrow timer)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  async markDelivered(@Param('id') id: string) {
    return this.orderService.markDelivered(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update any editable fields of an order' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an order' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.orderService.remove(id);
    return { message: 'Order deleted' };
  }
}
