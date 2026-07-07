import { IsOptional, IsString, Length } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters long' })
  name?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50, { message: 'Surname must be between 2 and 50 characters long' })
  surname?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  city?: string;

  @IsString()
  @IsOptional()
  @Length(2, 255)
  address?: string;

  @IsString()
  @IsOptional()
  @Length(5, 50)
  phone?: string;
}
