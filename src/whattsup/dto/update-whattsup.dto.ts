import { PartialType } from '@nestjs/swagger';
import { CreateWhattsupDto } from './create-whattsup.dto';

export class UpdateWhattsupDto extends PartialType(CreateWhattsupDto) {}
