import { IsOptional, IsString } from 'class-validator';

export class SearchClientsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
