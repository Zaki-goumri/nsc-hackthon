import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DeliveryAgenciesService } from './delivery-agencies.service';
import { CreateDeliveryAgencyDto } from './dto/create-delivery-agency.dto';
import { UpdateDeliveryAgencyDto } from './dto/update-delivery-agency.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination.dto';

@ApiTags('Delivery Agencies')
@Controller('delivery-agencies')
export class DeliveryAgenciesController {
  constructor(
    private readonly deliveryAgenciesService: DeliveryAgenciesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new delivery agency' })
  @ApiResponse({ status: 201, description: 'Delivery agency created successfully' })
  create(@Body() createDeliveryAgencyDto: CreateDeliveryAgencyDto) {
    return this.deliveryAgenciesService.create(createDeliveryAgencyDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all delivery agencies with pagination and optional name filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by agency name' })
  findAll(
    @Query() pagination: PaginationQueryDto,
    @Query('name') name?: string,
  ) {
    return this.deliveryAgenciesService.findAll(pagination, { name });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a delivery agency by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Agency ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryAgenciesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a delivery agency' })
  @ApiParam({ name: 'id', type: 'string', description: 'Agency ID' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDeliveryAgencyDto: UpdateDeliveryAgencyDto,
  ) {
    return this.deliveryAgenciesService.update(id, updateDeliveryAgencyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a delivery agency' })
  @ApiParam({ name: 'id', type: 'string', description: 'Agency ID' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryAgenciesService.remove(id);
  }
}
