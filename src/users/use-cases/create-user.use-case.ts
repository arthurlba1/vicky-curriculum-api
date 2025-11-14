import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UseCase } from '@/core/application/use-case.interface';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { User } from '@/users/user.entity';
import { UserRepository } from '@/users/user.repository';

@Injectable()
export class CreateUserUseCase implements UseCase<CreateUserDto, User> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.userRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
  }
}
