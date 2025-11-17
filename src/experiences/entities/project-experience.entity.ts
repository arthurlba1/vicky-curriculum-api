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

@Entity('project_experiences')
export class ProjectExperience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column()
  projectName: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  repoUrl?: string;

  @Column({ nullable: true })
  projectUrl?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'text' as any,
    transformer: new VectorTransformer(),
    nullable: true,
  })
  embedding?: number[];

  @Column({ nullable: true })
  embeddingModel?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
