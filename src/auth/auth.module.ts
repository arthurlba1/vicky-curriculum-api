import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '@/auth/auth.controller';
import { UsersModule } from '@/users/users.module';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { RegisterUserUseCase } from '@/auth/use-cases/register-user.use-case';
import { LoginUseCase } from '@/auth/use-cases/login.use-case';
import { GetLoggedUserUseCase } from '@/auth/use-cases/get-logged-user.use-case';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [RegisterUserUseCase, LoginUseCase, GetLoggedUserUseCase, JwtStrategy],
})
export class AuthModule {}
