import { JwtService } from '@nestjs/jwt';

import { RegisterUserUseCase } from '@/auth/use-cases/register-user.use-case';
import { CreateUserUseCase } from '@/users/use-cases/create-user.use-case';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let jwtService: jest.Mocked<JwtService>;

  const createUserDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    createUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateUserUseCase>;

    jwtService = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    useCase = new RegisterUserUseCase(createUserUseCase, jwtService);
  });

  it('should create user and return auth response', async () => {
    const user = { id: 'user-id' };
    const token = 'jwt-token';
    createUserUseCase.execute.mockResolvedValue(user as any);
    jwtService.sign.mockReturnValue(token);

    const result = await useCase.execute(createUserDto);

    expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
    expect(jwtService.sign).toHaveBeenCalledWith({ id: user.id });
    expect(result).toBeInstanceOf(AuthResponseDto);
    expect(result.accessToken).toBe(token);
  });
});
