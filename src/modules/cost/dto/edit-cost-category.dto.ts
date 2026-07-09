import { PartialType } from '@nestjs/mapped-types';

import { AddCostCategoryDto } from './add-cost-category.dto';

export class EditCostCategoryDto extends PartialType(AddCostCategoryDto) {}
