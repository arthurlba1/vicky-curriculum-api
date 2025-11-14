import { NotFoundException } from '@nestjs/common';

import { FindUserByEmailWithPasswordUseCase } from '@/users/use-cases/find-user-by-email-with-password.use-case';
import { UserRepository } from '@/users/user.repository';
import { User } from '@/users/user.entity';

describe('FindUserByEmailWithPasswordUseCase', () => {
  let useCase: FindUserByEmailWithPasswordUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const email = 'john@example.com';

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    useCase = new FindUserByEmailWithPasswordUseCase(userRepository);
  });

  it('should return the user when found', async () => {
    const user = { id: 'user-id', email } as User;
    userRepository.findByEmail.mockResolvedValue(user);

    const result = await useCase.execute(email);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(result).toBe(user);
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(email)).rejects.toBeInstanceOf(NotFoundException);
  });
});
