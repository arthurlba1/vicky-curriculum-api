import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UseCase } from '@/core/application/use-case.interface';
import { LoginDto } from '@/auth/dto/login.dto';
import { User } from '@/users/user.entity';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';
import { FindUserByEmailWithPasswordUseCase } from '@/users/use-cases/find-user-by-email-with-password.use-case';

@Injectable()
export class LoginUseCase implements UseCase<LoginDto, AuthResponseDto> {
  constructor(
    private readonly findUserByEmailWithPasswordUseCase: FindUserByEmailWithPasswordUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async execute(loginDto: LoginDto): Promise<AuthResponseDto> {
    let user: User;

    try {
      user = await this.findUserByEmailWithPasswordUseCase.execute(loginDto.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ id: user.id });
    return AuthResponseDto.fromToken(token);
  }
}
