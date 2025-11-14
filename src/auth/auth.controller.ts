import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';
import { Public } from '@/auth/guards/public.guard';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { STATUS_CODES } from '@/common/types/status';
import { ApiRegisterDocumentation, ApiLoginDocumentation, ApiGetMeDocumentation } from '@/auth/decorators/auth-swagger.decorator';
import { RegisterUserUseCase } from '@/auth/use-cases/register-user.use-case';
import { LoginUseCase } from '@/auth/use-cases/login.use-case';
import { GetLoggedUserUseCase } from '@/auth/use-cases/get-logged-user.use-case';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getLoggedUserUseCase: GetLoggedUserUseCase,
  ) {}

  @Public()
  @Post('register')
  @ApiRegisterDocumentation()
  async register(@Body() createUserDto: CreateUserDto): Promise<ApiResponseDto<AuthResponseDto>> {
    return {
      data: await this.registerUserUseCase.execute(createUserDto),
      message: 'User registered successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.CREATED,
    };
  }

  @Public()
  @Post('login')
  @ApiLoginDocumentation()
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<AuthResponseDto>> {
    return {
      data: await this.loginUseCase.execute(loginDto),
      message: 'User logged in successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Get('me')
  @ApiGetMeDocumentation()
  async getLoggedUser(@CurrentUser() user: UserResponseDto): Promise<ApiResponseDto<UserResponseDto>> {
    const foundUser = await this.getLoggedUserUseCase.execute(user.id);

    return {
      data: UserResponseDto.fromEntity(foundUser),
      message: 'User profile fetched successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }
}
