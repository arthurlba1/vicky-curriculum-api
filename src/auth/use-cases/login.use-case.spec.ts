import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginUseCase } from '@/auth/use-cases/login.use-case';
import { FindUserByEmailWithPasswordUseCase } from '@/users/use-cases/find-user-by-email-with-password.use-case';
import { LoginDto } from '@/auth/dto/login.dto';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let findUserByEmailWithPasswordUseCase: jest.Mocked<FindUserByEmailWithPasswordUseCase>;
  let jwtService: jest.Mocked<JwtService>;

  const loginDto: LoginDto = {
    email: 'john@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    findUserByEmailWithPasswordUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FindUserByEmailWithPasswordUseCase>;

    jwtService = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    useCase = new LoginUseCase(findUserByEmailWithPasswordUseCase, jwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate user and return auth response', async () => {
    const user = { id: 'user-id', password: 'hashed' };
    const token = 'jwt-token';

    findUserByEmailWithPasswordUseCase.execute.mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue(token);

    const result = await useCase.execute(loginDto);

    expect(findUserByEmailWithPasswordUseCase.execute).toHaveBeenCalledWith(loginDto.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    expect(jwtService.sign).toHaveBeenCalledWith({ id: user.id });
    expect(result).toBeInstanceOf(AuthResponseDto);
    expect(result.accessToken).toBe(token);
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    const user = { id: 'user-id', password: 'hashed' };

    findUserByEmailWithPasswordUseCase.execute.mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute(loginDto)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    findUserByEmailWithPasswordUseCase.execute.mockRejectedValue(new Error('not found'));

    await expect(useCase.execute(loginDto)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});
