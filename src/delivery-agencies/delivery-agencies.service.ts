import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeliveryAgencyDto } from './dto/create-delivery-agency.dto';
import { UpdateDeliveryAgencyDto } from './dto/update-delivery-agency.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryAgency } from './entities/delivery-agency.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from 'src/common/dtos/pagination.dto';
import { SearchService } from 'src/search/search.service';

export interface DeliveryAgencyFilters {
  name?: string;
}

export interface DeliveryAgencySearchResult {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  score?: number; // _score from ES
}

@Injectable()
export class DeliveryAgenciesService {
  private readonly AGENCY_INDEX = 'delivery_agencies';

  constructor(
    @InjectRepository(DeliveryAgency)
    private readonly deliveryAgencyRepositry: Repository<DeliveryAgency>,
    private readonly searchService: SearchService,
  ) {}

  async create(dto: CreateDeliveryAgencyDto): Promise<DeliveryAgency> {
    const agency = this.deliveryAgencyRepositry.create(dto);
    const saved = await this.deliveryAgencyRepositry.save(agency);
    await this.indexAgency(saved);
    return saved;
  }

  async findAll(
    pagination: PaginationQueryDto,
    filters?: DeliveryAgencyFilters,
  ): Promise<PaginatedResponseDto<DeliveryAgency>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<DeliveryAgency> = {};
    if (filters?.name) {
      where.name = Like(`%${filters.name}%`);
    }

    const [data, total] = await this.deliveryAgencyRepositry.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<DeliveryAgency> {
    const agency = await this.deliveryAgencyRepositry.findOne({
      where: { id },
    });

    if (!agency) {
      throw new NotFoundException(`Delivery agency ${id} not found`);
    }

    return agency;
  }
  async update(
    id: string,
    dto: UpdateDeliveryAgencyDto,
  ): Promise<DeliveryAgency> {
    const agency = await this.deliveryAgencyRepositry.preload({ id, ...dto });
    if (!agency) {
      throw new NotFoundException(`Delivery agency ${id} not found`);
    }

    const updated = await this.deliveryAgencyRepositry.save(agency);
    await this.indexAgency(updated);
    return updated;
  }
  async remove(id: string): Promise<void> {
    const agency = await this.findOne(id);
    await this.deliveryAgencyRepositry.remove(agency);

    await this.searchService.delete(this.AGENCY_INDEX, {
      term: { id: agency.id },
    });
  }

  async search(
    query: string,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<DeliveryAgencySearchResult | undefined>> {
    const { page = 1, limit = 10 } = pagination;
    const from = (page - 1) * limit;

    const esQuery: any = {
      bool: {
        must: [
          {
            multi_match: {
              query,
              fields: ['name^2'],
              fuzziness: 'AUTO',
            },
          },
        ],
      },
    };

    const esBody = {
      query: esQuery,
      from,
      size: limit,
      sort: [{ _score: { order: 'desc' } }, { createdAt: { order: 'desc' } }],
    };

    try {
      const hits = await this.searchService.search<DeliveryAgencySearchResult>(
        this.AGENCY_INDEX,
        esBody,
      );

      const countBody = { query: esQuery };
      const countHits =
        await this.searchService.search<DeliveryAgencySearchResult>(
          this.AGENCY_INDEX,
          countBody,
        );

      return new PaginatedResponseDto(hits, countHits.length, page, limit);
    } catch (err) {
      const fallback = await this.searchByName(query, pagination);

      const converted = fallback.data.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })) as DeliveryAgencySearchResult[];

      return new PaginatedResponseDto(
        converted,
        fallback.meta.total,
        page,
        limit,
      );
    }
  }

  private async searchByName(
    name: string,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<DeliveryAgency>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.deliveryAgencyRepositry.findAndCount({
      where: { name: Like(`%${name}%`) },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  private async indexAgency(agency: DeliveryAgency): Promise<void> {
    try {
      await this.searchService.index(this.AGENCY_INDEX, {
        ...JSON.parse(JSON.stringify(agency)),
        createdAt: agency.createdAt.toISOString(),
        updatedAt: agency.updatedAt.toISOString(),
      });
    } catch (e) {
      console.error('Failed to index agency in ES', e);
    }
  }

  async reindexAll(): Promise<void> {
    const agencies = await this.deliveryAgencyRepositry.find();
    for (const a of agencies) {
      await this.indexAgency(a);
    }
  }
}
