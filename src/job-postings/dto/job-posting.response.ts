import { ApiProperty } from '@nestjs/swagger';

import { JobPostingStatus } from '../entities/job-posting.entity';

export class JobPostingResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  rawText: string;

  @ApiProperty({ enum: JobPostingStatus })
  status: JobPostingStatus;

  @ApiProperty({ type: Object, nullable: true, required: false })
  summaryJson?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
