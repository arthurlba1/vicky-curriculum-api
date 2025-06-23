import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '@/auth/auth.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';
import { Public } from '@/auth/guards/public.guard';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { STATUS_CODES } from '@/common/types/status';
import { ApiRegisterDocumentation, ApiLoginDocumentation, ApiGetMeDocumentation } from './decorators/auth-swagger.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiRegisterDocumentation()
  async register(@Body() createUserDto: CreateUserDto): Promise<ApiResponseDto<AuthResponseDto>> {
    return {
      data: await this.authService.register(createUserDto),
      message: 'User registered successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.CREATED,
    };
  }

  @Public()
  @Post('login')
  @ApiLoginDocumentation()
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<AuthResponseDto>> {
    return {
      data: await this.authService.login(loginDto),
      message: 'User logged in successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Get('me')
  @ApiGetMeDocumentation()
  async getLoggedUser(@CurrentUser() user: UserResponseDto): Promise<ApiResponseDto<UserResponseDto>> {
    return {
      data: await this.authService.findLoggedUser(user.id),
      message: 'User profile fetched successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }
}
