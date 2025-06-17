import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { AuthService } from '@/auth/auth.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';
import { Public } from '@/auth/guards/public.guard';

@ApiTags('auth')
@ApiExtraModels(AuthResponseDto)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User registered successfully'
        }
      }
    }
  })
  async register(@Body() createUserDto: CreateUserDto): Promise<{ message: string }> {
    return this.authService.register(createUserDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'User logged in successfully',
    type: AuthResponseDto
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
} 