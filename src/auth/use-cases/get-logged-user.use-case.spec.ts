import { GetLoggedUserUseCase } from '@/auth/use-cases/get-logged-user.use-case';
import { FindUserByIdUseCase } from '@/users/use-cases/find-user-by-id.use-case';
import { User } from '@/users/user.entity';

describe('GetLoggedUserUseCase', () => {
  let useCase: GetLoggedUserUseCase;
  let findUserByIdUseCase: jest.Mocked<FindUserByIdUseCase>;

  const userId = 'user-id';

  beforeEach(() => {
    findUserByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FindUserByIdUseCase>;

    useCase = new GetLoggedUserUseCase(findUserByIdUseCase);
  });

  it('should return user by id', async () => {
    const user = { id: userId } as User;
    findUserByIdUseCase.execute.mockResolvedValue(user);

    const result = await useCase.execute(userId);

    expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
    expect(result).toBe(user);
  });
});
