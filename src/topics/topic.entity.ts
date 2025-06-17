import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

import { Experience } from '@/experiences/experience.entity';
import { TopicCategories } from '@/topics/topics.types';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100
  })
  category: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Experience, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'experienceId' })
  experience: Experience;

  @Column()
  experienceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
