import { ApiProperty } from '@nestjs/swagger';
import { 
    IsEmail, 
    IsEnum, 
    IsOptional, 
    IsString, 
    MinLength,
    IsNotEmpty,
    IsStrongPassword
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ 
    description: 'The email address of the user',
    example: 'user@example.com',
    format: 'email',
   })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'password123',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: Role, default: Role.USER, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
