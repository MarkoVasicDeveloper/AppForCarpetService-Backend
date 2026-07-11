import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class TriggerNotificationDto {
  @ApiProperty({
    description: 'The email address of the recipient',
    example: 'client@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'The subject line for the email',
    example: 'Important Account Update',
  })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({
    description: 'The template file name without extension',
    example: 'welcome',
  })
  @IsString()
  @IsNotEmpty()
  template!: string;

  @ApiProperty({
    description: 'Dynamic key-value pairs to populate the variables inside the template',
    example: { name: 'Marko Vasic', role: 'Premium Client' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: Record<string, unknown>;
}
