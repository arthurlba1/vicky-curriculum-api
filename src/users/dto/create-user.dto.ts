import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'The name of the user',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'The email address of the user',
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'The password of the user',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
