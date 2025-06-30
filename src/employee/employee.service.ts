import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ShopEmployee } from './entities/employee.entity';
import { UserService } from '../user/user.service';
import { ShopService } from '../shop/shop.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../common/dtos/pagination.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(ShopEmployee)
    private readonly shopEmployeeRepository: Repository<ShopEmployee>,
    private readonly userService: UserService,
    private readonly shopService: ShopService,
  ) {}

  /**
   * Add an employee to a shop by userId or email
   */
  async addEmployeeToShop(
    shopId: string,
    createEmployeeDto: CreateEmployeeDto | { email: string },
  ): Promise<ShopEmployee> {
    await this.shopService.findOne(shopId);

    let userId: string;

    if ('userId' in createEmployeeDto) {
      userId = createEmployeeDto.userId;
      await this.userService.findById(userId);
    } else if ('email' in createEmployeeDto) {
      const user = await this.userService.findOneByEmail(createEmployeeDto.email);
      userId = user.id;
    } else {
      throw new BadRequestException('Either userId or email must be provided');
    }

    const existingEmployee = await this.shopEmployeeRepository.findOne({
      where: { shopId, userId },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee already exists in this shop');
    }

    const shopEmployee = this.shopEmployeeRepository.create({
      shopId,
      userId,
    });

    return await this.shopEmployeeRepository.save(shopEmployee);
  }

  /**
   * Get all employees of a shop with pagination
   */
  async getShopEmployees(
    shopId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ShopEmployee>> {

    await this.shopService.findOne(shopId);

    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.shopEmployeeRepository.findAndCount({
      where: { shopId },
      relations: ['user', 'shop'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Remove an employee from a shop
   */
  async removeEmployeeFromShop(shopId: string, userId: string): Promise<void> {
    await this.shopService.findOne(shopId);

    await this.userService.findById(userId);

    const shopEmployee = await this.shopEmployeeRepository.findOne({
      where: { shopId, userId },
    });

    if (!shopEmployee) {
      throw new NotFoundException('Employee not found in this shop');
    }

    await this.shopEmployeeRepository.remove(shopEmployee);
  }

}
