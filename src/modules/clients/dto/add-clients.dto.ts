import { IsNotEmpty, IsString, Length, IsOptional, IsPhoneNumber } from 'class-validator';

export class AddClientsDto {
  @IsNotEmpty({ message: 'Name is required.' })
  @IsString({ message: 'Name must be a string.' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters.' })
  name!: string;

  @IsNotEmpty({ message: 'Surname is required.' })
  @IsString({ message: 'Surname must be a string.' })
  @Length(2, 50, { message: 'Surname must be between 2 and 50 characters.' })
  surname!: string;

  @IsNotEmpty({ message: 'Address is required.' })
  @IsString({ message: 'Address must be a string.' })
  @Length(3, 100, { message: 'Address must be between 3 and 100 characters.' })
  address!: string;

  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: 'Phone number must be a valid international number.',
  })
  phone?: string;
}
