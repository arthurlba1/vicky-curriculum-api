import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UseCase } from '@/core/application/use-case.interface';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { CreateUserUseCase } from '@/users/use-cases/create-user.use-case';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';

@Injectable()
export class RegisterUserUseCase implements UseCase<CreateUserDto, AuthResponseDto> {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    const user = await this.createUserUseCase.execute(createUserDto);
    const token = this.jwtService.sign({ id: user.id });
    return AuthResponseDto.fromToken(token);
  }
}
