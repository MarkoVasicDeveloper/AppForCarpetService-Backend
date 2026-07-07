import { PartialType } from '@nestjs/mapped-types';

import { AddCarpetDto } from './add-carpet.dto';

export class EditCarpetDto extends PartialType(AddCarpetDto) {}
