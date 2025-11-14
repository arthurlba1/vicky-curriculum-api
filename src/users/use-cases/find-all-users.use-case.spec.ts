import { UserRepository } from '@/users/user.repository';
import { FindAllUsersUseCase } from '@/users/use-cases/find-all-users.use-case';
import { User } from '@/users/user.entity';

describe('FindAllUsersUseCase', () => {
  let useCase: FindAllUsersUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      find: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    useCase = new FindAllUsersUseCase(userRepository);
  });

  it('should return users ordered by creation date with skills relation', async () => {
    const users = [
      { id: '2', name: 'John' },
      { id: '1', name: 'Jane' },
    ] as User[];

    userRepository.find.mockResolvedValue(users);

    const result = await useCase.execute();

    expect(userRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
    });
    expect(result).toBe(users);
  });
});
