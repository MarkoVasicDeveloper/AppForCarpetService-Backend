import { PartialType } from '@nestjs/mapped-types';

import { AddIncomeEntryDto } from './add-income-entry.dto';

export class EditIncomeEntryDto extends PartialType(AddIncomeEntryDto) {}
