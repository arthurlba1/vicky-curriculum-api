import { Injectable } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { FindUserByIdUseCase } from '@/users/use-cases/find-user-by-id.use-case';
import { User } from '@/users/user.entity';

@Injectable()
export class GetLoggedUserUseCase implements UseCase<string, User> {
  constructor(private readonly findUserByIdUseCase: FindUserByIdUseCase) {}

  execute(userId: string): Promise<User> {
    return this.findUserByIdUseCase.execute(userId);
  }
}
