import { Injectable, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { User } from '@/users/user.entity';
import { UserRepository } from '@/users/user.repository';

@Injectable()
export class FindUserByEmailWithPasswordUseCase implements UseCase<string, User> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
