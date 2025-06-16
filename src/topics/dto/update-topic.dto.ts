import { PartialType } from '@nestjs/mapped-types';

import { CreateTopicDto } from '@/topics/dto/create-topic.dto';

export class UpdateTopicDto extends PartialType(CreateTopicDto) {}