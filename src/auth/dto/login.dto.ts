import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: 'The email address of the user',
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'The password of the user'
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
