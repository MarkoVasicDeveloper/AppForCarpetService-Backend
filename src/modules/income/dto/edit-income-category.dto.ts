import { PartialType } from '@nestjs/mapped-types';

import { AddIncomeCategoryDto } from './add-income-category.dto';

export class EditIncomeCategoryDto extends PartialType(AddIncomeCategoryDto) {}
