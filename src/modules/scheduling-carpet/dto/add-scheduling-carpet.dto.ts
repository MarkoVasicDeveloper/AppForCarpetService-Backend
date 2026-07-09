import { IsNotEmpty, IsString, IsOptional, IsEmail, Length, IsPhoneNumber } from 'class-validator';

export class AddSchedulingCarpetDto {
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required.' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters long.' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Customer surname is required.' })
  @Length(2, 50, { message: 'Surname must be between 2 and 50 characters long.' })
  surname!: string;

  @IsString()
  @IsNotEmpty({ message: 'Delivery address is required.' })
  @Length(5, 150, { message: 'Address must be between 5 and 150 characters long.' })
  address!: string;

  @IsPhoneNumber(undefined, {
    message:
      'Please provide a valid international phone number starting with + (e.g., +38161234567).',
  })
  @IsNotEmpty({ message: 'Phone number is required.' })
  phone!: string;

  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
