import { NotFoundException } from '@nestjs/common';

import { UserRepository } from '@/users/user.repository';
import { RemoveUserUseCase } from '@/users/use-cases/remove-user.use-case';
import { User } from '@/users/user.entity';

describe('RemoveUserUseCase', () => {
  let useCase: RemoveUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const userId = 'user-id';

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    useCase = new RemoveUserUseCase(userRepository);
  });

  it('should remove the user when found', async () => {
    const user = { id: userId } as User;
    userRepository.findById.mockResolvedValue(user);
    userRepository.remove.mockResolvedValue(user);

    await useCase.execute(userId);

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.remove).toHaveBeenCalledWith(user);
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(userId)).rejects.toBeInstanceOf(NotFoundException);
    expect(userRepository.remove).not.toHaveBeenCalled();
  });
});
