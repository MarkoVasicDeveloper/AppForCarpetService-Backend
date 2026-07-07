import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetCarpetsByDateDto {
  @IsNotEmpty({ message: 'Date query parameter is required.' })
  @IsDateString({}, { message: 'Date must be a valid ISO date string (YYYY-MM-DD).' })
  date!: string;
}
