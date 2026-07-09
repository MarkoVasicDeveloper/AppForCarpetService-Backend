import { IsNotEmpty, IsString, IsInt, IsPositive, Length } from 'class-validator';

export class AddIncomeCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category name is required.' })
  @Length(2, 255, { message: 'Name must be between 2 and 255 characters long.' })
  name!: string;

  @IsInt()
  @IsPositive({ message: 'Price must be a positive number.' })
  @IsNotEmpty({ message: 'Price is required.' })
  price!: number;
}
