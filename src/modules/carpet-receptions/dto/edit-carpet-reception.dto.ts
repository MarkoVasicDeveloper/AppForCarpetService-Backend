import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsPositive,
  Min,
} from 'class-validator';

export class EditCarpetReception {
  @IsInt()
  @IsPositive()
  carpetReceptionId!: number;

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

  @IsOptional()
  @IsBoolean()
  prepare?: boolean;

  @IsOptional()
  @IsBoolean()
  delivered?: boolean;

  @IsOptional()
  @IsDateString()
  deliveredTime?: Date;

  @IsOptional()
  @IsInt()
  @IsPositive()
  userId?: number;
}
