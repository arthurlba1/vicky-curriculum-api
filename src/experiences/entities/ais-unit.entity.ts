import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ExperienceType } from '@/experiences/types/experience.types';
import { VectorTransformer } from '@/database/pgvector.type';

@Entity('ais_units')
export class AisUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ExperienceType,
  })
  experienceType: ExperienceType;

  @Column()
  experienceId: string;

  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'text' })
  impact: string;

  @Column({ type: 'text' })
  context: string;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  skills: string[];

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
