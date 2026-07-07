import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class AddWorkerDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters long' })
  @Matches(/^[a-zA-Z0-9_\s-]+$/, {
    message: 'Name can only contain letters, numbers, spaces, hyphens, and underscores',
  })
  name!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 64, { message: 'Password must be between 8 and 64 characters long' })
  password!: string;
}
