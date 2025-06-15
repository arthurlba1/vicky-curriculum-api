import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { User } from '@/users/entities/user.entity';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  password: string;

  createdAt: Date;

  updatedAt: Date;

  static fromEntity(entity: User): UserResponseDto {
    return plainToInstance(UserResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: User[]): UserResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}

export class UserResponseWithPasswordDto extends UserResponseDto {
  @Expose()
  password: string;
}
