import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsDateString, IsPositive } from 'class-validator';

export class AddSubscriberDto {
  @IsDateString({}, { message: 'Expiration date (expireAt) must be a valid ISO date string.' })
  @IsNotEmpty({ message: 'Expiration date is required.' })
  @Transform(({ value }) => {
    return typeof value === 'string' && value.includes('T') ? value.split('T')[0] : value;
  })
  expireAt!: Date;

  @IsNumber({}, { message: 'Price must be a number.' })
  @IsPositive({ message: 'Price must be a positive number.' })
  @IsNotEmpty({ message: 'Price is required.' })
  price!: number;
}
