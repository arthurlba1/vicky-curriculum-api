import { Expose, plainToInstance } from 'class-transformer';

export class AuthResponseDto {
  @Expose()
  accessToken: string;

  static fromToken(token: string): AuthResponseDto {
    return plainToInstance(AuthResponseDto, { accessToken: token }, {
      excludeExtraneousValues: true,
    });
  }
}

export class UserAuthResponseDto {
  @Expose()
  id: string;
}
