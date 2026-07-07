import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class AddUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters long' })
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50, { message: 'Surname must be between 2 and 50 characters long' })
  surname!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @Length(5, 50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email!: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  city!: string;

  @IsString()
  @IsOptional()
  @Length(2, 255)
  address!: string;

  @IsString()
  @IsOptional()
  @Length(5, 50)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 100, { message: 'Password must be at least 8 characters long' })
  password!: string;
}
