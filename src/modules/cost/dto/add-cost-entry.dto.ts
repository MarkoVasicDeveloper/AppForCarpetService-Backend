import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsPositive,
} from 'class-validator';

export class AddCostEntryDto {
  @IsInt()
  @IsNotEmpty({ message: 'Category ID (categoryId) is required.' })
  categoryId!: number;

  @IsInt()
  @IsNotEmpty({ message: 'Supplier ID (supplierId) is required.' })
  supplierId!: number;

  @IsString()
  @IsNotEmpty({ message: 'Product or service name is required.' })
  product!: string;

  @IsInt()
  @IsPositive({ message: 'Quantity must be a positive number.' })
  @IsNotEmpty({ message: 'Quantity is required.' })
  quantity!: number;

  @IsInt()
  @IsPositive({ message: 'Price must be a positive number.' })
  @IsNotEmpty({ message: 'Price is required.' })
  price!: number;

  @IsBoolean()
  @IsOptional()
  paid: boolean = false;

  @IsDateString({}, { message: 'Maturity date must be a valid ISO date string.' })
  @IsOptional()
  @Transform(({ value }) => {
    return typeof value === 'string' && value.includes('T') ? value.split('T')[0] : value;
  })
  maturityDate?: Date;
}
