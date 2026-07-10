import { IsNotEmpty, IsString } from 'class-validator';

export class FindWorkerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
