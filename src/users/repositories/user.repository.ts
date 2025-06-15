import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { User } from '@/users/entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async createUser(name: string, email: string, password: string): Promise<User> {
    const user = this.create({
      name,
      email,
      password,
    });
    return this.save(user);
  }
}
