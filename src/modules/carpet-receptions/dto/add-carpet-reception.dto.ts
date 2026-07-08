import { IsInt, IsOptional, IsString, IsPositive, Min } from 'class-validator';

export class AddCarpetReceptionDto {
  @IsInt()
  @IsPositive()
  clientsId!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfCarpet?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfTracks?: number;

  @IsOptional()
  @IsString()
  note?: string | null;

  @IsInt()
  @IsPositive()
  carpetReceptionUser!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  userId?: number;
}
