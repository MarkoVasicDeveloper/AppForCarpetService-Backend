import { PartialType } from '@nestjs/mapped-types';

import { AddSupplierDto } from './add-supplier.dto';

export class EditSupplierDto extends PartialType(AddSupplierDto) {}
