import { IsNotEmpty, IsString } from 'class-validator';

export class AuthAdministratorDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required for authentication.' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required for authentication.' })
  password!: string;
}
