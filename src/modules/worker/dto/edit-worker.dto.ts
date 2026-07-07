import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class EditWorkerDto {
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  @Length(8, 64, { message: 'Current password must be between 8 and 64 characters long' })
  password!: string;

  @IsString({ message: 'New password must be a string' })
  @IsOptional()
  @Length(8, 64, { message: 'New password must be between 8 and 64 characters long' })
  newPassword!: string;

  @IsString({ message: 'New name must be a string' })
  @IsOptional()
  @Length(3, 50, { message: 'New name must be between 3 and 50 characters long' })
  @Matches(/^[a-zA-Z0-9_\s-]+$/, {
    message: 'New name can only contain letters, numbers, spaces, hyphens, and underscores',
  })
  newName?: string;
}
