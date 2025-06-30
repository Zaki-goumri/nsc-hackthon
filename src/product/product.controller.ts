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
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PaginationQueryDto } from '../common/dtos/pagination.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { SupabaseService } from 'src/supabase/supabase.service';
import { User } from 'src/user/entities/user.entity';
import { User as UserExtractor } from 'src/auth/decorators/user.decorator';

@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post('')
  @ApiOperation({ summary: 'Create a product under a specific shop' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBody({
    description: 'Product creation payload with optional images',
    type: CreateProductDto,
  })
  async create(
    @UserExtractor() payload: User,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() images?: Express.Multer.File[],
  ) {
    const urls: string[] = [];

    if (!images || images?.length) {
      for (const file of images as Express.Multer.File[]) {
        const url = await this.supabaseService.uploadFile(
          file,
          'products',
          'nsc-hackathon',
        );
        urls.push(url);
      }
    }
    return await this.productService.create(createProductDto, urls, payload.id);
  }

  @Get('')
  @ApiOperation({
    summary: 'Get all products (with pagination, filtering, search, category)',
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
    name: 'shopId',
    required: false,
    type: String,
    description: 'Filter by shop ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or description',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query() query: QueryProductDto,
  ) {
    return await this.productService.findAll(paginationQuery, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update a product's info" })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productService.remove(id);
    return;
  }

  @Get('shops/:shopId/products')
  @ApiOperation({ summary: 'Get all products for a specific shop' })
  @ApiParam({ name: 'shopId', type: 'string', description: 'Shop ID' })
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
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or description',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category',
  })
  async getShopProducts(
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Query() paginationQuery: PaginationQueryDto,
    @Query() query: QueryProductDto,
  ) {
    return await this.productService.getShopProducts(
      shopId,
      paginationQuery,
      query,
    );
  }

  @Get(':id/metadata')
  @ApiOperation({ summary: 'Get only the metadata JSON for a product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  async getProductMetadata(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productService.getProductMetadata(id);
  }
}
