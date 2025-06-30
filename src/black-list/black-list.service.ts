import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Not, IsNull } from 'typeorm';
import { CreateBlackListDto } from './dto/create-black-list.dto';
import { UpdateBlackListDto } from './dto/update-black-list.dto';
import { BlackList } from './entities/black-list.entity';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '../common/dtos/pagination.dto';

@Injectable()
export class BlackListService {
  constructor(
    @InjectRepository(BlackList)
    private readonly blackListRepository: Repository<BlackList>,
  ) {}

  /**
   * Create a new blacklist entry
   */
  async create(
    createBlackListDto: CreateBlackListDto,
    sourceUserId: string,
  ): Promise<BlackList> {
    const blackListEntry = this.blackListRepository.create({
      ...createBlackListDto,
      sourceUserId,
    });
    return await this.blackListRepository.save(blackListEntry);
  }

  /**
   * Get all blacklist entries with pagination
   */
  async getManyWithPagination(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BlackList>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.blackListRepository.findAndCount({
      relations: ['source'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Get a single blacklist entry by ID
   */
  async getOne(id: string): Promise<BlackList> {
    const blackListEntry = await this.blackListRepository.findOne({
      where: { id },
      relations: ['source'],
    });

    if (!blackListEntry) {
      throw new NotFoundException(`Blacklist entry with ID ${id} not found`);
    }

    return blackListEntry;
  }

  /**
   * Update a blacklist entry
   */
  async update(
    id: string,
    updateBlackListDto: UpdateBlackListDto,
  ): Promise<BlackList> {
    const blackListEntry = await this.getOne(id);

    Object.assign(blackListEntry, updateBlackListDto);

    return await this.blackListRepository.save(blackListEntry);
  }

  /**
   * Remove a blacklist entry
   */
  async remove(id: string): Promise<void> {
    const blackListEntry = await this.getOne(id);
    await this.blackListRepository.remove(blackListEntry);
  }

  /**
   * Check if a user is blacklisted by their email, phone number, or name
   * @param email - User's email address
   * @param phoneNumber - User's phone number
   * @returns Promise<{ isBlacklisted: boolean; reason?: string; field?: 'email' | 'phoneNumber'; }>
   */
  async isUserBlacklisted(
    email?: string,
    phoneNumber?: string,
  ): Promise<{
    isBlacklisted: boolean;
    reason?: string;
    field?: 'email' | 'phoneNumber';
  }> {
    await this.removeExpiredEntries();

    if (!email && !phoneNumber) return { isBlacklisted: false };

    const where = [
      ...(email ? [{ email }] : []),
      ...(phoneNumber ? [{ phoneNumber }] : []),
    ];

    const entry = await this.blackListRepository.findOne({ where });

    if (!entry) return { isBlacklisted: false };

    return {
      isBlacklisted: true,
      reason: entry.reason,
      field: entry.email ? 'email' : 'phoneNumber',
    };
  }

  /**
   * Remove expired blacklist entries
   */
  private async removeExpiredEntries(): Promise<void> {
    const now = new Date();
    await this.blackListRepository.delete({
      expiresAt: LessThanOrEqual(now),
    });
  }

  /**
   * Get blacklist entries by type
   */
  async getByType(
    type: 'email' | 'phone',
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BlackList>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const where =
      type === 'email'
        ? { email: Not(IsNull()) }
        : { phoneNumber: Not(IsNull()) };

    const [data, total] = await this.blackListRepository.findAndCount({
      where,
      relations: ['source'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Search blacklist entries by value
   */
  async searchByValue(
    value: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BlackList>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.blackListRepository.findAndCount({
      where: [{ email: value.toLowerCase() }, { phoneNumber: value }],
      relations: ['source'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Get blacklist statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byType: Record<string, number>;
    expired: number;
  }> {
    const total = await this.blackListRepository.count();

    const byType = await this.blackListRepository
      .createQueryBuilder('blacklist')
      .select('blacklist.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('blacklist.type')
      .getRawMany();

    const expired = await this.blackListRepository.count({
      where: {
        expiresAt: LessThanOrEqual(new Date()),
      },
    });

    const typeStats = byType.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {});

    return {
      total,
      byType: typeStats,
      expired,
    };
  }
}
