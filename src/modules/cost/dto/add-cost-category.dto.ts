import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AddCostCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category title is required.' })
  @Length(2, 50, { message: 'Title must be between 2 and 50 characters long.' })
  title!: string;
}
