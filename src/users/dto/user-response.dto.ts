import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/users/user.entity';
import { SkillResponseDto } from '@/skills/dto/skill-response.dto';

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

  @ApiProperty({ description: 'Phone number of the user', required: false })
  @Expose()
  phone?: string;

  @ApiProperty({ description: 'Location of the user', required: false })
  @Expose()
  location?: string;

  @ApiProperty({ description: 'LinkedIn URL', required: false })
  @Expose()
  linkedin?: string;

  @ApiProperty({ description: 'GitHub URL', required: false })
  @Expose()
  github?: string;

  @ApiProperty({ description: 'Portfolio URL', required: false })
  @Expose()
  portfolio?: string;

  @ApiProperty({ description: 'Creation date of the user' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date of the user' })
  @Expose()
  updatedAt: Date;

  password: string;

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
