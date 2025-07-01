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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { PaginationQueryDto } from '../common/dtos/pagination.dto';
import { Shop } from './entities/shop.entity';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { User } from '../user/entities/user.entity';
import { User as UserExtractor } from '../auth/decorators/user.decorator';
import { SupabaseService } from '../supabase/supabase.service';

@ApiTags('Shop Management')
@UseGuards(AccessTokenGuard)
@Controller('shops')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shop with image upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Shop name' },
        description: { type: 'string', description: 'Shop description' },
        image: {
          type: 'file',
          format: 'binary',
          description: 'Shop banner/logo image',
        },
      },
      required: ['name', 'description'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Shop created successfully',
    type: Shop,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createShopDto: CreateShopDto,
    @UserExtractor() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    let imageUrl = '';

    if (image) {
      try {
        imageUrl = await this.supabaseService.uploadFile(
          image,
          'shops', // Store in shops folder
          'nsc-hackathon',
        );
      } catch (error) {
        throw new Error(`Failed to upload image: ${error}`);
      }
    }

    const shopData = {
      ...createShopDto,
      imageUrl: imageUrl || createShopDto.imageUrl || '',
    };

    return await this.shopService.create(shopData, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shops with pagination and filters' })
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
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by shop name',
  })
  @ApiQuery({
    name: 'ownerId',
    required: false,
    type: String,
    description: 'Filter by owner ID',
  })
  @ApiResponse({ status: 200, description: 'Shops retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('name') name?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    const filters = { name, ownerId };
    return await this.shopService.findAll(paginationQuery, filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search shops using Elasticsearch' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
  })
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
  @ApiQuery({
    name: 'ownerId',
    required: false,
    type: String,
    description: 'Filter by owner ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Missing search query' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchShops(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
    @Query('ownerId') ownerId?: string,
  ) {
    const filters = ownerId ? { ownerId } : undefined;
    return await this.shopService.searchShops(query, paginationQuery, filters);
  }

  @Get('mine')
  @ApiOperation({ summary: "Get current user's shops" })
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
    description: 'User shops retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMine(
    @Query() paginationQuery: PaginationQueryDto,
    @UserExtractor() user: User,
  ) {
    const userId = user.id;
    return await this.shopService.findMine(userId, paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific shop by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Shop ID' })
  @ApiResponse({
    status: 200,
    description: 'Shop retrieved successfully',
    type: Shop,
  })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return await this.shopService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shop with image upload (owner only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Shop name' },
        description: { type: 'string', description: 'Shop description' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Shop banner/logo image',
        },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Shop ID' })
  @ApiResponse({
    status: 200,
    description: 'Shop updated successfully',
    type: Shop,
  })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @UserExtractor() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|webp)' }),
        ],
        fileIsRequired: false, // Image is optional
      }),
    )
    image?: Express.Multer.File,
  ) {
    let imageUrl = '';

    // Upload new image to Supabase if provided
    if (image) {
      try {
        imageUrl = await this.supabaseService.uploadFile(
          image,
          'shops', // Store in shops folder
          'nsc-hackathon',
        );
      } catch (error) {
        throw new Error(`Failed to upload image: ${error}`);
      }
    }

    // Update shop data with new image URL if provided
    const shopData = {
      ...updateShopDto,
      ...(imageUrl && { imageUrl }), // Only include imageUrl if new image was uploaded
    };

    return await this.shopService.update(id, shopData, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shop (owner only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Shop ID' })
  @ApiResponse({ status: 204, description: 'Shop deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @UserExtractor() user: User) {
    await this.shopService.remove(id, user.id);
  }
}
