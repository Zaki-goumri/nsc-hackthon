import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ShopService } from '../shop/shop.service';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '../common/dtos/pagination.dto';
import { ProductCategory } from './types/category.type';

export interface ProductFilters {
  shopId?: string;
  search?: string;
  category?: ProductCategory;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly shopService: ShopService,
  ) {}

  /**
   * Create a new product under a specific shop
   */

  async create(
    dto: CreateProductDto,
    imageUrls: string[],
    userId?: string,
  ): Promise<Product> {
    const shop = await this.shopService.findOne(dto.shopId);
    if (userId && shop.ownerId !== userId) {
      throw new ForbiddenException(
        'You can only create products in your own shops',
      );
    }

    const product = this.productRepository.create({
      ...dto,
      quantity: dto.quantity ?? 0,
      imageUrls,
    });

    return this.productRepository.save(product);
  }
  /**
   * Get all products with pagination and filtering
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    filters?: ProductFilters,
  ): Promise<PaginatedResponseDto<Product>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const whereConditions: FindOptionsWhere<Product> = {};

    if (filters?.shopId) {
      whereConditions.shopId = filters.shopId;
    }

    if (filters?.category) {
      whereConditions.category = filters.category;
    }

    let query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.shop', 'shop')
      .skip(skip)
      .take(limit)
      .orderBy('product.createdAt', 'DESC');

    if (filters?.search) {
      query = query.where(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.shopId) {
      query = query.andWhere('product.shopId = :shopId', {
        shopId: filters.shopId,
      });
    }

    if (filters?.category) {
      query = query.andWhere('product.category = :category', {
        category: filters.category,
      });
    }

    const [data, total] = await query.getManyAndCount();

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Get a single product by ID
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['shop'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Update a product's information
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId?: string,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (userId) {
      const shop = await this.shopService.findOne(product.shopId);
      if (shop.ownerId !== userId) {
        throw new ForbiddenException(
          'You can only update products in your own shops',
        );
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  /**
   * Delete a product
   */
  async remove(id: string, userId?: string): Promise<void> {
    const product = await this.findOne(id);

    // If userId is provided, check if user owns the shop
    if (userId) {
      const shop = await this.shopService.findOne(product.shopId);
      if (shop.ownerId !== userId) {
        throw new ForbiddenException(
          'You can only delete products in your own shops',
        );
      }
    }

    await this.productRepository.remove(product);
  }

  /**
   * Get all products for a specific shop
   */
  async getShopProducts(
    shopId: string,
    paginationQuery: PaginationQueryDto,
    filters?: Omit<ProductFilters, 'shopId'>,
  ): Promise<PaginatedResponseDto<Product>> {
    await this.shopService.findOne(shopId);

    const shopFilters: ProductFilters = {
      ...filters,
      shopId,
    };

    return await this.findAll(paginationQuery, shopFilters);
  }

  /**
   * Get only the metadata JSON for a product
   */
  async getProductMetadata(id: string): Promise<Record<string, any> | null> {
    const product = await this.productRepository.findOne({
      where: { id },
      select: ['metadata'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product.metadata || null;
  }

  /**
   * Search products by name or description
   */
  async searchProducts(
    searchTerm: string,
    paginationQuery: PaginationQueryDto,
    filters?: Omit<ProductFilters, 'search'>,
  ): Promise<PaginatedResponseDto<Product>> {
    const searchFilters: ProductFilters = {
      ...filters,
      search: searchTerm,
    };

    return await this.findAll(paginationQuery, searchFilters);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: ProductCategory,
    paginationQuery: PaginationQueryDto,
    filters?: Omit<ProductFilters, 'category'>,
  ): Promise<PaginatedResponseDto<Product>> {
    const categoryFilters: ProductFilters = {
      ...filters,
      category,
    };

    return await this.findAll(paginationQuery, categoryFilters);
  }

  /**
   * Update product quantity (for inventory management)
   */
  async updateQuantity(
    id: string,
    quantity: number,
    userId?: string,
  ): Promise<Product> {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const product = await this.findOne(id);

    // If userId is provided, check if user owns the shop
    if (userId) {
      const shop = await this.shopService.findOne(product.shopId);
      if (shop.ownerId !== userId) {
        throw new ForbiddenException(
          'You can only update products in your own shops',
        );
      }
    }

    product.quantity = quantity;
    return await this.productRepository.save(product);
  }

  /**
   * Get product statistics
   */
  async getProductStatistics(shopId?: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    averagePrice: number;
    totalValue: number;
  }> {
    let query = this.productRepository.createQueryBuilder('product');

    if (shopId) {
      query = query.where('product.shopId = :shopId', { shopId });
    }

    const total = await query.getCount();

    const categoryQuery = this.productRepository
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(*)', 'count');

    if (shopId) {
      categoryQuery.where('product.shopId = :shopId', { shopId });
    }

    const categoryStats = await categoryQuery
      .groupBy('product.category')
      .getRawMany();

    const byCategory = categoryStats.reduce((acc, item) => {
      acc[item.category] = parseInt(item.count);
      return acc;
    }, {});

    const statsQuery = this.productRepository
      .createQueryBuilder('product')
      .select('AVG(product.price)', 'averagePrice')
      .addSelect('SUM(product.price * product.quantity)', 'totalValue');

    if (shopId) {
      statsQuery.where('product.shopId = :shopId', { shopId });
    }

    const stats = await statsQuery.getRawOne();

    return {
      total,
      byCategory,
      averagePrice: parseFloat(stats.averagePrice) || 0,
      totalValue: parseFloat(stats.totalValue) || 0,
    };
  }
}
