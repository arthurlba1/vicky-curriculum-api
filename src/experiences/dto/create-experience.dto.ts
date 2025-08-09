import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsDate, IsOptional, IsBoolean, MinLength, IsArray, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import { ExperienceCategory } from '@/experiences/experiences.types';

export class CreateExperienceDto {
  @ApiProperty({ enum: ExperienceCategory })
  @IsEnum(ExperienceCategory)
  category: ExperienceCategory;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subName?: string;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Array of skills used in this experience',
    example: ['csharp', 'rust', 'javascript']
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  skills: string[];

  @ApiProperty({ 
    description: 'Object containing descriptions for each skill',
    example: {
      'csharp': 'Used C# for backend development with Entity Framework',
      'rust': 'Built high-performance microservices using Rust',
      'javascript': 'Developed interactive frontend features'
    }
  })
  @IsObject()
  skillsDescription: Record<string, string>;
}

export class CreateExperiencesDto {
  @ApiProperty({ 
    description: 'Array of experiences to create',
    type: [CreateExperienceDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExperienceDto)
  experiences: CreateExperienceDto[];
}
