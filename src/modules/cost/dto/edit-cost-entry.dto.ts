import { PartialType } from '@nestjs/mapped-types';

import { AddCostEntryDto } from './add-cost-entry.dto';

export class EditCostEntryDto extends PartialType(AddCostEntryDto) {}
