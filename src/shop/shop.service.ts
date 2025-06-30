import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import { PaginationQueryDto, PaginatedResponseDto } from '../common/dtos/pagination.dto';
import { SearchService } from '../search/search.service';

export interface ShopFilters {
  name?: string;
  ownerId?: string;
}

export interface ShopSearchResult {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  score?: number;
}

@Injectable()
export class ShopService {
  private readonly SHOP_INDEX = 'shops';

  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly searchService: SearchService,
  ) {}

  /**
   * Create a new shop
   */
  async create(createShopDto: CreateShopDto, ownerId: string): Promise<Shop> {
    const shop = this.shopRepository.create({
      ...createShopDto,
      ownerId,
    });
    
    const savedShop = await this.shopRepository.save(shop);
    
    // Index the shop in Elasticsearch
    await this.indexShop(savedShop);
    
    return savedShop;
  }

  /**
   * Get all shops with pagination and filters
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    filters?: ShopFilters,
  ): Promise<PaginatedResponseDto<Shop>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: FindOptionsWhere<Shop> = {};
    
    if (filters?.name) {
      whereConditions.name = Like(`%${filters.name}%`);
    }
    
    if (filters?.ownerId) {
      whereConditions.ownerId = filters.ownerId;
    }

    const [data, total] = await this.shopRepository.findAndCount({
      where: whereConditions,
      relations: ['owner'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Get a single shop by ID
   */
  async findOne(id: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }

    return shop;
  }

  /**
   * Get current user's shops
   */
  async findMine(
    ownerId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Shop>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.shopRepository.findAndCount({
      where: { ownerId },
      relations: ['owner'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Update a shop (only by owner)
   */
  async update(id: string, updateShopDto: UpdateShopDto, userId: string): Promise<Shop> {
    const shop = await this.findOne(id);

    // Check if user is the owner
    if (shop.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own shops');
    }

    Object.assign(shop, updateShopDto);
    const updatedShop = await this.shopRepository.save(shop);
    
    // Update the shop in Elasticsearch
    await this.indexShop(updatedShop);
    
    return updatedShop;
  }

  /**
   * Delete a shop (only by owner)
   */
  async remove(id: string, userId: string): Promise<void> {
    const shop = await this.findOne(id);

    // Check if user is the owner
    if (shop.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own shops');
    }

    await this.shopRepository.remove(shop);
    
    // Remove from Elasticsearch
    await this.searchService.delete(this.SHOP_INDEX, {
      term: { id: shop.id }
    });
  }

  /**
   * Advanced search using Elasticsearch
   */
  async searchShops(
    query: string,
    paginationQuery: PaginationQueryDto,
    filters?: { ownerId?: string }
  ): Promise<PaginatedResponseDto<ShopSearchResult>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const from = (page - 1) * limit;

    // Build Elasticsearch query
    const searchQuery: any = {
      bool: {
        must: [
          {
            multi_match: {
              query,
              fields: ['name^2', 'description'], // name has higher weight
              fuzziness: 'AUTO', 
              operator: 'or'
            }
          }
        ]
      }
    };

    // Add filters
    if (filters?.ownerId) {
      searchQuery.bool.filter = [
        { term: { ownerId: filters.ownerId } }
      ];
    }

    const searchBody = {
      query: searchQuery,
      from: from,
      size: limit,
      sort: [
        { _score: { order: 'desc' } },
        { createdAt: { order: 'desc' } }
      ]
    };

    try {
      const results = await this.searchService.search<ShopSearchResult>(
        this.SHOP_INDEX,
        searchBody
      );

      // Get total count for pagination
      const countQuery = {
        query: searchQuery
      };
      
      const countResult = await this.searchService.search<ShopSearchResult>(
        this.SHOP_INDEX,
        countQuery
      );

      return new PaginatedResponseDto(
        results as ShopSearchResult[],
        countResult.length,
        page,
        limit
      );
    } catch (error) {
      // Fallback to PostgreSQL search if Elasticsearch fails
      const fallbackResult = await this.searchByName(query, paginationQuery);
      
      // Convert Shop entities to ShopSearchResult format
      const convertedResults: ShopSearchResult[] = fallbackResult.data.map(shop => ({
      ...shop,
      description:shop.description ?? '',
        createdAt: shop.createdAt.toISOString(),
        updatedAt: shop.updatedAt.toISOString(),
      }));

      return new PaginatedResponseDto(
        convertedResults,
        fallbackResult.meta.total,
        page,
        limit
      );
    }
  }

  /**
   * Search shops by name (PostgreSQL fallback)
   */
  async searchByName(
    name: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Shop>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.shopRepository.findAndCount({
      where: { name: Like(`%${name}%`) },
      relations: ['owner'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Index a shop in Elasticsearch
   */
  private async indexShop(shop: Shop): Promise<void> {
    try {
      const shopDocument = {
       ...shop,
        createdAt: shop.createdAt.toISOString(),
        updatedAt: shop.updatedAt.toISOString(),
      };

      // Cast to any to bypass the type constraint temporarily
      await (this.searchService as any).index(this.SHOP_INDEX, shopDocument);
    } catch (error) {
      console.error('Failed to index shop in Elasticsearch:', error);
    }
  }

  /**
   * Reindex all shops in Elasticsearch
   */
  async reindexAllShops(): Promise<void> {
    const shops = await this.shopRepository.find();
    
    for (const shop of shops) {
      await this.indexShop(shop);
    }
  }

  /**
   * Check if user owns a shop
   */
  async isOwner(shopId: string, userId: string): Promise<boolean> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      select: ['ownerId'],
    });

    return shop?.ownerId === userId;
  }

  /**
   * Get shops by owner ID
   */
  async findByOwner(
    ownerId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Shop>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.shopRepository.findAndCount({
      where: { ownerId },
      relations: ['owner'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Get shop statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byOwner: Record<string, number>;
  }> {
    const total = await this.shopRepository.count();
    
    const byOwner = await this.shopRepository
      .createQueryBuilder('shop')
      .select('shop.ownerId', 'ownerId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('shop.ownerId')
      .getRawMany();

    const ownerStats = byOwner.reduce((acc, item) => {
      acc[item.ownerId] = parseInt(item.count);
      return acc;
    }, {});

    return {
      total,
      byOwner: ownerStats,
    };
  }
}
