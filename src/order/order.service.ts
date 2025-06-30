import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { PaginationQueryDto, PaginatedResponseDto } from '../common/dtos/pagination.dto';
import { SearchService } from '../search/search.service';
import { ORDER_STATUS_VALUES, OrderStatus } from './types/order-status.type';
import { RISK_LEVEL_VALUES, RiskLevel } from './types/risk-level.type';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly searchService: SearchService,
  ) {}

  /**
   * Create a new order
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    return await this.orderRepository.save(order);
  }

  /**
   * List/search orders (all shops) with pagination and filters, using Elasticsearch
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    filters?: {
      shopId?: string;
      orderStatus?: OrderStatus;
      riskLevel?: RiskLevel;
      search?: string;
    },
  ): Promise<PaginatedResponseDto<Order>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const from = (page - 1) * limit;

    const esQuery: any = { bool: { must: [] as any[], filter: [] as any[] } };
    if (filters?.search) {
      esQuery.bool.must.push({
        multi_match: {
          query: filters.search,
          fields: ['customerName', 'customerPhone', 'customerAddress'],
          fuzziness: 'AUTO',
        },
      });
    }
    if (filters?.shopId) {
      esQuery.bool.filter.push({ term: { shopId: filters.shopId } });
    }
    if (filters?.orderStatus) {
      esQuery.bool.filter.push({ term: { orderStatus: filters.orderStatus } });
    }
    if (filters?.riskLevel) {
      esQuery.bool.filter.push({ term: { riskLevel: filters.riskLevel } });
    }

    const searchBody = {
      query: esQuery,
      from,
      size: limit,
      sort: [{ createdAt: { order: 'desc' } }],
    };

    try {
      const results = await this.searchService.search<Order>('orders', searchBody);
      const filteredResults: Order[] = (Array.isArray(results) ? results : []).filter((r): r is Order => !!r);
      const total = (results as any)?.meta?.total ?? filteredResults.length;
      return new PaginatedResponseDto(filteredResults, total, page, limit);
    } catch (e) {
      const [data, total] = await this.orderRepository.findAndCount({
        where: {
          ...(filters?.shopId && { shopId: filters.shopId }),
          ...(filters?.orderStatus && { orderStatus: filters.orderStatus }),
          ...(filters?.riskLevel && { riskLevel: filters.riskLevel }),
        },
        skip: from,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return new PaginatedResponseDto(data, total, page, limit);
    }
  }

  /**
   * Get one order by ID
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /**
   * Update any editable fields 
   */
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  /**
   * Soft-delete an order 
   */
  async remove(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }
}
