import { IsNotEmpty, IsString, Length, Matches, IsOptional } from 'class-validator';

export class EditAdministratorDto {
  @IsString({ message: 'Current password must be a string.' })
  @IsNotEmpty({ message: 'Current password is required to save changes.' })
  password!: string;

  @IsOptional()
  @IsString({ message: 'Username must be a string.' })
  @Length(4, 50, { message: 'Username must be between 4 and 50 characters long.' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'Username contains invalid characters.',
  })
  username?: string;

  @IsOptional()
  @IsString({ message: 'New password must be a string.' })
  @Length(6, 100, { message: 'New password must be at least 6 characters long.' })
  newPassword?: string;
}
