import { PartialType } from '@nestjs/swagger';
import { CreateBlackListDto } from './create-black-list.dto';

export class UpdateBlackListDto extends PartialType(CreateBlackListDto) {}
