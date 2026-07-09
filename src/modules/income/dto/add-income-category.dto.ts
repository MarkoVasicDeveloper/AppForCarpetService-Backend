import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AddIncomeCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category name is required.' })
  @Length(2, 50, { message: 'Category name must be between 2 and 50 characters long.' })
  name!: string;
}
