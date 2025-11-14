import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from '@/users/users.controller';
import { User } from '@/users/user.entity';
import { UserRepository } from '@/users/user.repository';
import { CreateUserUseCase } from '@/users/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from '@/users/use-cases/find-all-users.use-case';
import { FindUserByIdUseCase } from '@/users/use-cases/find-user-by-id.use-case';
import { RemoveUserUseCase } from '@/users/use-cases/remove-user.use-case';
import { FindUserByEmailWithPasswordUseCase } from '@/users/use-cases/find-user-by-email-with-password.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UserRepository,
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    RemoveUserUseCase,
    FindUserByEmailWithPasswordUseCase,
  ],
  exports: [CreateUserUseCase, FindUserByIdUseCase, FindUserByEmailWithPasswordUseCase],
})
export class UsersModule {}
