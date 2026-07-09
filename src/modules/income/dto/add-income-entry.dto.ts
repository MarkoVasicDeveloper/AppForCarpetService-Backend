import { IsNotEmpty, IsInt, IsPositive, IsString, Length } from 'class-validator';

export class AddIncomeEntryDto {
  @IsString()
  @IsNotEmpty({ message: 'Income item name is required.' })
  @Length(2, 100, { message: 'Item name must be between 2 and 100 characters long.' })
  name!: string;

  @IsInt()
  @IsNotEmpty({ message: 'Category ID (categoryId) is required.' })
  categoryId!: number;

  @IsInt()
  @IsPositive({ message: 'Value must be a positive number.' })
  @IsNotEmpty({ message: 'Value amount is required.' })
  value!: number;
}
