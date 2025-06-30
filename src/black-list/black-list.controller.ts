import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiTooManyRequestsResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BlackListService } from './black-list.service';
import { CreateBlackListDto } from './dto/create-black-list.dto';
import { UpdateBlackListDto } from './dto/update-black-list.dto';
import { PaginationQueryDto } from '../common/dtos/pagination.dto';
import { BlackList } from './entities/black-list.entity';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { User } from 'src/user/entities/user.entity';
import { User as UserExtractor } from 'src/auth/decorators/user.decorator';

@ApiTags('Blacklist Management')
@ApiTooManyRequestsResponse({
  description: 'rate limiting to many messges',
  example: 'ThrottlerException: Too Many Requests',
})
@ApiNotFoundResponse({
  description: 'user with id ${id} not found',
  example: 'user with id ${id} not found',
})
@ApiInternalServerErrorResponse({
  description: 'internal server error',
  example: 'internal server error',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized user or Unauthorized role to do this action ',
  example: 'Role MANAGER is not authorized for this action',
})
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('black-list')
export class BlackListController {
  constructor(private readonly blackListService: BlackListService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blacklist entry' })
  @ApiResponse({
    status: 201,
    description: 'Blacklist entry created successfully',
    type: BlackList,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBlackListDto: CreateBlackListDto,
    @UserExtractor() payload: User,
  ) {
    return await this.blackListService.create(createBlackListDto, payload.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blacklist entries with pagination' })
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
  @ApiResponse({
    status: 200,
    description: 'Blacklist entries retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/BlackList' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return await this.blackListService.getManyWithPagination(paginationQuery);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get blacklist entries by type (email or phone)' })
  @ApiParam({
    name: 'type',
    enum: ['email', 'phone'],
    description: 'Type of blacklist entry',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Blacklist entries by type retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid type parameter' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getByType(
    @Param('type') type: 'email' | 'phone',
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return await this.blackListService.getByType(type, paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search blacklist entries by value' })
  @ApiQuery({
    name: 'value',
    required: true,
    type: String,
    description: 'Value to search for',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Missing search value' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchByValue(
    @Query('value') value: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return await this.blackListService.searchByValue(value, paginationQuery);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get blacklist statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byType: {
          type: 'object',
          properties: {
            email: { type: 'number' },
            phone: { type: 'number' },
          },
        },
        expired: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatistics() {
    return await this.blackListService.getStatistics();
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if a user is blacklisted' })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Email to check',
  })
  @ApiQuery({
    name: 'phoneNumber',
    required: false,
    type: String,
    description: 'Phone number to check',
  })
  @ApiResponse({
    status: 200,
    description: 'Blacklist check completed',
    schema: {
      type: 'object',
      properties: {
        isBlacklisted: { type: 'boolean' },
        reason: { type: 'string' },
        field: { type: 'string', enum: ['email', 'phoneNumber'] },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No email or phone provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkBlacklist(
    @Query('email') email?: string,
    @Query('phoneNumber') phoneNumber?: string,
  ) {
    return await this.blackListService.isUserBlacklisted(email, phoneNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific blacklist entry by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Blacklist entry ID' })
  @ApiResponse({
    status: 200,
    description: 'Blacklist entry retrieved successfully',
    type: BlackList,
  })
  @ApiResponse({ status: 404, description: 'Blacklist entry not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return await this.blackListService.getOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blacklist entry' })
  @ApiParam({ name: 'id', type: 'string', description: 'Blacklist entry ID' })
  @ApiResponse({
    status: 200,
    description: 'Blacklist entry updated successfully',
    type: BlackList,
  })
  @ApiResponse({ status: 404, description: 'Blacklist entry not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateBlackListDto: UpdateBlackListDto,
  ) {
    return await this.blackListService.update(id, updateBlackListDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a blacklist entry' })
  @ApiParam({ name: 'id', type: 'string', description: 'Blacklist entry ID' })
  @ApiResponse({
    status: 204,
    description: 'Blacklist entry removed successfully',
  })
  @ApiResponse({ status: 404, description: 'Blacklist entry not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.blackListService.remove(id);
  }
}
