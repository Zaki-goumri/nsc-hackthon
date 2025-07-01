import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '../common/dtos/pagination.dto';
import { SearchService } from '../search/search.service';
import { OrderStatus } from './types/order-status.type';
import { RiskLevel } from './types/risk-level.type';
import { format } from 'date-fns';

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
      const results = await this.searchService.search<Order>(
        'orders',
        searchBody,
      );
      const filteredResults: Order[] = (
        Array.isArray(results) ? results : []
      ).filter((r): r is Order => !!r);
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

  /**
   * Confirm an order (customer confirms via WhatsApp/email)
   */
  async confirmOrder(id: string): Promise<Order> {
    const order = await this.findOne(id);
    order.orderStatus = 'confirmed'; // or ORDER_STATUS_VALUES.CONFIRMED
    return this.orderRepository.save(order);
  }

  /**
   * Mark an order as delivered (starts 48h escrow timer)
   */
  async markDelivered(id: string): Promise<Order> {
    const order = await this.findOne(id);
    order.orderStatus = 'delivered'; // or ORDER_STATUS_VALUES.DELIVERED
    // Optionally, start 48h escrow timer logic here
    return this.orderRepository.save(order);
  }

  async getPaginatedOrders(
    pagination: PaginationQueryDto,
    shopId: string,
  ): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (shopId) {
      where.shopId = shopId;
    }
    const [data, total] = await this.orderRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['product', 'deliveryAgency'],
    });
    const mapped = data.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      product: order.product?.name || '',
      date: order.createdAt ? format(new Date(order.createdAt), 'MMMM dd') : '',
      deliveryAgency: order.deliveryAgency?.name || '',
      paymentStatus: order.paymentStatus
        ? order.paymentStatus.charAt(0).toUpperCase() +
          order.paymentStatus.slice(1)
        : '',
      contactMethod: order.contactPref
        ? order.contactPref.charAt(0).toUpperCase() + order.contactPref.slice(1)
        : '',
    }));
    return new PaginatedResponseDto(orders, total, page, limit);
  }

  async getProductInventory(
    pagination: PaginationQueryDto,
    shopId?: string,
  ): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (shopId) {
      where.shopId = shopId;
    }
    const [data, total] = await this.orderRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['product'],
    });

    const mapped = data.map((order) => ({
      id: order.product?.id || '',
      name: order.product?.name || '',
      image: order.product?.imageUrls?.[0] || '',
      orderStatus: order.orderStatus
        ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)
        : '',
      price: order.product?.price ? `${order.product.price}DA` : '',
    }));

    return new PaginatedResponseDto(delivery_data, total, page, limit);
  }
}

export const orders = [
  {
    id: 1,
    customerName: 'Benammour Rihab Meriem',
    product: 'Smartwatch DZ+',
    date: 'June 28',
    deliveryAgency: 'Yalidine',
    paymentStatus: 'Paid',
    contactMethod: 'WhatsApp',
  },
  {
    id: 2,
    customerName: 'Benammour Rihab Meriem',
    product: 'Smartwatch DZ+',
    date: 'June 28',
    deliveryAgency: 'Yalidine',
    paymentStatus: 'Paid',
    contactMethod: 'WhatsApp',
  },
  {
    id: 3,
    customerName: 'Benammour Rihab Meriem',
    product: 'Smartwatch DZ+',
    date: 'June 28',
    deliveryAgency: 'Yalidine',
    paymentStatus: 'Paid',
    contactMethod: 'WhatsApp',
  },
  {
    id: 4,
    customerName: 'Benammour Rihab Meriem',
    product: 'Smartwatch DZ+',
    date: 'June 28',
    deliveryAgency: 'Yalidine',
    paymentStatus: 'Paid',
    contactMethod: 'WhatsApp',
  },
  {
    id: 5,
    customerName: 'Benammour Rihab Meriem',
    product: 'Smartwatch DZ+',
    date: 'June 28',
    deliveryAgency: 'Yalidine',
    paymentStatus: 'Paid',
    contactMethod: 'WhatsApp',
  },
  {
    id: 6,
    customerName: 'Benammour Rihab Meriem',
    product: 'Smartwatch DZ+',
    date: 'June 28',
    deliveryAgency: 'Yalidine',
    paymentStatus: 'Paid',
    contactMethod: 'WhatsApp',
  },
];

export const delivery_data = [
  {
    id: '202547896',
    name: 'Smartwatch DZ+',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop&crop=center',
    orderStatus: 'on Hold',
    price: '2500.00DA',
  },
  {
    id: '202547896',
    name: 'Smartwatch DZ+',
    image:
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80&h=80&fit=crop&crop=center',
    orderStatus: 'Arrived',
    price: '2500.00DA',
  },
  {
    id: '202547896',
    name: 'Smartwatch DZ+',
    image:
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=80&h=80&fit=crop&crop=center',
    orderStatus: 'Canceled',
    price: '2500.00DA',
  },
  {
    id: '202547896',
    name: 'Smartwatch DZ+',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    orderStatus: 'on Hold',
    price: '2500.00DA',
  },
  {
    id: '202547896',
    name: 'Smartwatch DZ+',
    image:
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=80&h=80&fit=crop&crop=center',
    orderStatus: 'Arrived',
    price: '2500.00DA',
  },
  {
    id: '202547896',
    name: 'Smartwatch DZ+',
    image:
      'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=80&h=80&fit=crop&crop=center',
    orderStatus: 'Canceled',
    price: '2500.00DA',
  },
];

