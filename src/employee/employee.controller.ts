import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, CreateEmployeeByEmailDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaginationQueryDto } from '../common/dtos/pagination.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@ApiTags('Shop Employee Management')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('shops/:shopId/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Add an employee to a shop by userId or email' })
  @ApiParam({ name: 'shopId', type: 'string', description: 'Shop ID' })
  @ApiResponse({ status: 201, description: 'Employee added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({ status: 404, description: 'Shop or user not found' })
  @ApiResponse({ status: 409, description: 'Employee already exists in this shop' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addEmployee(
    @Param('shopId') shopId: string,
    @Body() createEmployeeDto: CreateEmployeeDto | CreateEmployeeByEmailDto,
  ) {
    return await this.employeeService.addEmployeeToShop(shopId, createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees of a shop with pagination' })
  @ApiParam({ name: 'shopId', type: 'string', description: 'Shop ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getShopEmployees(
    @Param('shopId') shopId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return await this.employeeService.getShopEmployees(shopId, paginationQuery);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Remove an employee from a shop' })
  @ApiParam({ name: 'shopId', type: 'string', description: 'Shop ID' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Employee removed successfully' })
  @ApiResponse({ status: 404, description: 'Shop, user, or employee relationship not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeEmployee(
    @Param('shopId') shopId: string,
    @Param('userId') userId: string,
  ) {
    await this.employeeService.removeEmployeeFromShop(shopId, userId);
    return { message: 'Employee removed successfully' };
  }    
}
