import { Injectable } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { UserRepository } from '@/users/user.repository';
import { User } from '@/users/user.entity';

@Injectable()
export class FindAllUsersUseCase implements UseCase<void, User[]> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
