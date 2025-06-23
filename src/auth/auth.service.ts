import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto } from '@/auth/dto/login.dto';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { UsersService } from '@/users/users.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(createUserDto);

    const accessToken = this.generateToken(user.id);
    return AuthResponseDto.fromToken(accessToken);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateToken(user.id);
    return AuthResponseDto.fromToken(accessToken);
  }

  async findLoggedUser(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(userId);
    return UserResponseDto.fromEntity(user);
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign({ id: userId });
  }
}
