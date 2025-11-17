import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '@/users/user.entity';
import { VectorTransformer } from '@/database/pgvector.type';

export enum JobPostingStatus {
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed',
}

@Entity('job_postings')
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  rawText: string;

  @Column({
    type: 'enum',
    enum: JobPostingStatus,
    default: JobPostingStatus.PROCESSING,
  })
  status: JobPostingStatus;

  @Column({
    type: 'text' as any,
    transformer: new VectorTransformer(),
    nullable: true,
  })
  embedding?: number[];

  @Column({ nullable: true })
  embeddingModel?: string;

  @Column({ type: 'jsonb', nullable: true })
  summaryJson?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
