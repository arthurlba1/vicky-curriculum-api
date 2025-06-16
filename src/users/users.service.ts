import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

import { UserRepository } from '@/users/user.repository';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UserResponseDto, UserResponseWithPasswordDto } from '@/users/dto/user-response.dto';


@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { name, email, password } = createUserDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new ConflictException('Email already exists');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.createUser({
      name,
      email,
      password: hashedPassword,
    })

    return UserResponseDto.fromEntity(user);
  }

  async findByEmailWithPassword(email: string): Promise<UserResponseWithPasswordDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToInstance(UserResponseWithPasswordDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return UserResponseDto.fromEntities(users);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserResponseDto.fromEntity(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromEntity(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
  }
}
