import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/users/user.entity';

@Exclude()
export class UserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The name of the user' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'The email address of the user' })
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
  @ApiProperty({ description: 'The password of the user' })
  @Expose()
  password: string;
}
