import {
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsString,
  Min,
  IsDateString,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class AddCarpetDto {
  @IsInt({ message: 'Carpet reception user ID must be an integer.' })
  @IsNotEmpty({ message: 'Carpet reception user ID is required.' })
  @Min(1, { message: 'Carpet reception user ID must be a valid positive number.' })
  carpetReception!: number;

  @IsNumber({}, { message: 'Width must be a valid number (decimals allowed).' })
  @IsNotEmpty({ message: 'Width is required.' })
  @Min(0.1, { message: 'Width must be greater than 0.' })
  width!: number;

  @IsNumber({}, { message: 'Height must be a valid number (decimals allowed).' })
  @IsNotEmpty({ message: 'Height is required.' })
  @Min(0.1, { message: 'Height must be greater than 0.' })
  height!: number;

  @IsNumber({}, { message: 'Price must be a valid number.' })
  @IsNotEmpty({ message: 'Price is required.' })
  @Min(0, { message: 'Price cannot be negative.' })
  price!: number;

  @IsOptional()
  @IsInt({ message: 'Worker ID must be an integer.' })
  @IsPositive({ message: 'Worker ID must be a valid positive number.' })
  workerId?: number;

  @IsString({ message: 'Delivery date must be a string.' })
  @IsNotEmpty({ message: 'Delivery date is required.' })
  @IsDateString({}, { message: 'Delivery date must be a valid ISO date format (YYYY-MM-DD).' })
  deliveryDate!: string;

  @IsInt({ message: 'Client ID must be an integer.' })
  @IsNotEmpty({ message: 'Client ID is required.' })
  @Min(1, { message: 'Client ID must be a valid positive number.' })
  clientsId!: number;
}
