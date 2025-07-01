import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepositry: Repository<Order>,
  ) {}
  async summeryData(shopId: string) {
    const totalDeliveredOrders = await this.orderRepositry.findBy({
      orderStatus: 'delivered',
      shopId,
    });
    const totalPrice = totalDeliveredOrders.reduce((sum, order) => {
      return sum + (order.product?.price || 0);
    }, 0);

    const [__, totalOrders] = await this.orderRepositry.findAndCount({
      where: { shopId },
    });
    const [_, highRiskOrder] = await this.orderRepositry.findAndCount({
      where: { riskLevel: 'high', shopId },
    });
    return {
      totalPrice,
      totalOrders,
      highRiskOrder,
    };
  }

  async getOrdersOverTime(
    shopId: string,
  ): Promise<{ name: string; orders: number }[]> {
    const [orders, _] = await this.orderRepositry.findAndCountBy({
      orderStatus: 'delivered',
      shopId,
    });

    const groupedByDate: Record<string, number> = {};

    for (const order of orders) {
      const date = new Date(order.createdAt);
      const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

      groupedByDate[mmdd] = (groupedByDate[mmdd] || 0) + 1;
    }

    return Object.entries(groupedByDate).map(([date, count]) => ({
      name: date,
      orders: count,
    }));
  }
}
