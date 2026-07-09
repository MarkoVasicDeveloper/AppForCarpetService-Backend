import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class AddSupplierDto {
  @IsString()
  @IsNotEmpty({ message: 'Supplier name is required.' })
  name!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @Length(9, 9, { message: 'PIB must be exactly 9 characters long.' })
  pib?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Bank account number cannot be an empty string.' })
  bankAccount?: string;
}
