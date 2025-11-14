import { Injectable, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { UserRepository } from '@/users/user.repository';
import { User } from '@/users/user.entity';

@Injectable()
export class FindUserByIdUseCase implements UseCase<string, User> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
