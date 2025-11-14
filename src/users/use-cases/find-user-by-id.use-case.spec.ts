import { NotFoundException } from '@nestjs/common';

import { UserRepository } from '@/users/user.repository';
import { FindUserByIdUseCase } from '@/users/use-cases/find-user-by-id.use-case';
import { User } from '@/users/user.entity';

describe('FindUserByIdUseCase', () => {
  let useCase: FindUserByIdUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const userId = 'user-id';

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    useCase = new FindUserByIdUseCase(userRepository);
  });

  it('should return the user when found', async () => {
    const user = { id: userId } as User;
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute(userId);

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(result).toBe(user);
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(userId)).rejects.toBeInstanceOf(NotFoundException);
  });
});
