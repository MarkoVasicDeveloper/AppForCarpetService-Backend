import { IsNotEmpty, IsInt, IsPositive } from 'class-validator';

export class AddIncomeEntryDto {
  @IsInt()
  @IsNotEmpty({ message: 'Income category ID (incomeId) is required.' })
  incomeId!: number;

  @IsInt()
  @IsPositive({ message: 'Value must be a positive number.' })
  @IsNotEmpty({ message: 'Value amount is required.' })
  value!: number;
}
