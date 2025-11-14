import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { FindUserByIdUseCase } from '@/users/use-cases/find-user-by-id.use-case';
import { UserAuthResponseDto } from '@/auth/dto/auth-response.dto';
import { UserResponseDto } from '@/users/dto/user-response.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: UserAuthResponseDto): Promise<UserResponseDto> {
    try {
      const user = await this.findUserByIdUseCase.execute(payload.id);
      return UserResponseDto.fromEntity(user);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
