import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class AddAdministratorDto {
  @IsString({ message: 'Username must be a string.' })
  @IsNotEmpty({ message: 'Username cannot be empty.' })
  @Length(4, 50, { message: 'Username must be between 4 and 50 characters long.' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'Username can only contain letters, numbers, hyphens, dots, and underscores.',
  })
  username!: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @Length(6, 100, { message: 'Password must be at least 6 characters long.' })
  password!: string;
}
