import { Injectable } from '@nestjs/common';
import { CreateBlackListDto } from './dto/create-black-list.dto';
import { UpdateBlackListDto } from './dto/update-black-list.dto';

@Injectable()
export class BlackListService {
  create(createBlackListDto: CreateBlackListDto) {
    return 'This action adds a new blackList';
  }

  findAll() {
    return `This action returns all blackList`;
  }

  findOne(id: number) {
    return `This action returns a #${id} blackList`;
  }

  update(id: number, updateBlackListDto: UpdateBlackListDto) {
    return `This action updates a #${id} blackList`;
  }

  remove(id: number) {
    return `This action removes a #${id} blackList`;
  }
}
