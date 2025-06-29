import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { generateHash } from 'src/common/utils/hash.utils';
import { SignupDto } from 'src/auth/dto/requests/sign-up.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_NAME } from 'src/common/constants/queues.name';
import { Queue } from 'bullmq';
import { LOGGER } from 'src/common/constants/logger.name';
import { PaginatedResponseDto } from 'src/common/dtos/pagination.dto';
@Injectable()
export class UserService {
  logger = new Logger(LOGGER.USER);
  private static readonly CACHE_PREFIX = 'user';
  private static readonly LIST_CACHE_PREFIX = 'users';

  constructor(
    @InjectRepository(User)
    private userRepositry: Repository<User>,
    private redisService: RedisService,
    private dataSource: DataSource,
    @InjectQueue(QUEUE_NAME.MAIL_QUEUE) private readonly mailQueue: Queue,
  ) {}

  static getUserCacheKey(criteria: string | number): string {
    return `${UserService.CACHE_PREFIX}:${criteria}`;
  }
  private static getUserListCacheKey(page: number, limit: number): string {
    return `${UserService.LIST_CACHE_PREFIX}:page:${page}:limit:${limit}`;
  }
  async create(createUser: SignupDto): Promise<User> {
    const hashedPassword = await generateHash(createUser.password);
    return await this.userRepositry.save({
      ...createUser,
      password: hashedPassword,
    });
  }

  async findByPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<User>> {
    const cacheKey = UserService.getUserListCacheKey(page, limit);

    const cachedData =
      await this.redisService.get<PaginatedResponseDto<User>>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const skip = (page - 1) * limit;
    const [users, total] = await this.userRepositry.findAndCount({
      skip,
      take: limit,
    });
    const result = {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return result;
  }

  async findById(id: string): Promise<User> {
    const cachedUser = await this.redisService.get<User>(
      UserService.getUserCacheKey(id),
    );
    if (cachedUser) return cachedUser;

    const userFound = await this.userRepositry.findOne({ where: { id } });
    if (!userFound) {
      throw new NotFoundException('the user does not exist');
    }
    await this.redisService.set<User>(`user_${id}`, userFound);
    return userFound;
  }

  async findOneByEmail(email: string): Promise<User> {
    const cacheKey = UserService.getUserCacheKey(email);
    const cachedUser = await this.redisService.get<User>(cacheKey);
    if (cachedUser) return cachedUser;

    const userFound = await this.userRepositry.findOne({ where: { email } });
    if (!userFound)
      throw new NotFoundException(
        `the user with email ${email} does not exist`,
      );
    await this.redisService.set(cacheKey, JSON.stringify(userFound), 600);
    return userFound;
  }

  async update(id: string, updateUserData: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userRepositry.save({
      ...updateUserData,
      id,
    });
    if (!updatedUser)
      throw new BadRequestException(`User with ID ${id} not updated`);
    await this.redisService.set<User>(`user_${id}`, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<string> {
    const deletedUser = await this.userRepositry.delete(id);
    if (deletedUser.affected === 0)
      throw new NotFoundException(`User with ID ${id} not found`);
    await this.redisService.delete(`user_${id}`);
    return 'user deleted';
  }
}
