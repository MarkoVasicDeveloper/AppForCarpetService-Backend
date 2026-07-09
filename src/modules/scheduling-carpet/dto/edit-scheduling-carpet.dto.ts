import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';

import { AddSchedulingCarpetDto } from './add-scheduling-carpet.dto';

export class EditSchedulingCarpetDto extends PartialType(AddSchedulingCarpetDto) {
  @IsBoolean()
  @IsOptional()
  isScheduling?: boolean;
}
