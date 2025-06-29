import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BlackListService } from './black-list.service';
import { CreateBlackListDto } from './dto/create-black-list.dto';
import { UpdateBlackListDto } from './dto/update-black-list.dto';

@Controller('black-list')
export class BlackListController {
  constructor(private readonly blackListService: BlackListService) {}

  @Post()
  create(@Body() createBlackListDto: CreateBlackListDto) {
    return this.blackListService.create(createBlackListDto);
  }

  @Get()
  findAll() {
    return this.blackListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blackListService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlackListDto: UpdateBlackListDto) {
    return this.blackListService.update(+id, updateBlackListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blackListService.remove(+id);
  }
}
