import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Identity (username or email) is required' })
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    return value;
  })
  identity!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters' })
  password!: string;
}
