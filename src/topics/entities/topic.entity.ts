import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

import { Experience } from '@/experiences/entities/experience.entity';
import { TopicCategories } from '@/topics/topics.types';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TopicCategories,
  })
  category: TopicCategories;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Experience, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'experience_id' })
  experience: Experience;

  @Column()
  experience_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 