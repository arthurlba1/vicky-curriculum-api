import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { User } from '@/users/user.entity';
import { UserRepository } from '@/users/user.repository';
import { CreateUserUseCase } from '@/users/use-cases/create-user.use-case';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const dto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'plainPassword',
    phone: '+551199999999',
    location: 'São Paulo, BR',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    portfolio: 'https://johndoe.dev',
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    useCase = new CreateUserUseCase(userRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user with hashed password', async () => {
    const hashedPassword = 'hashedPassword';
    const createdUser = { id: 'uuid', ...dto, password: hashedPassword } as User;

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.createUser.mockResolvedValue(createdUser);
    const hashMock = bcrypt.hash as unknown as jest.Mock<
      Promise<string>,
      [string | Buffer, string | number]
    >;
    hashMock.mockResolvedValue(hashedPassword);

    const result = await useCase.execute(dto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
    expect(userRepository.createUser).toHaveBeenCalledWith({
      ...dto,
      password: hashedPassword,
    });
    expect(result).toBe(createdUser);
  });

  it('should throw ConflictException when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing' } as User);

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(userRepository.createUser).not.toHaveBeenCalled();
  });
});
