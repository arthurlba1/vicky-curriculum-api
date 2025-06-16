import { PartialType } from '@nestjs/mapped-types';

import { CreateExperienceDto } from '@/experiences/dto/create-experience.dto';

export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {}