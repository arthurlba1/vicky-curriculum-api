import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { User } from '@/users/user.entity';
import { ExperienceCategory } from '@/experiences/experiences.types';
import { Topic } from '@/topics/topic.entity';

@Entity('experiences')
export class Experience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ExperienceCategory,
    default: ExperienceCategory.PROFESSIONAL,
  })
  category: ExperienceCategory;

  @Column()
  name: string;

  @Column({ nullable: true })
  subName: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: false })
  isCurrent: boolean;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Topic, (topic) => topic.experience, { cascade: true })
  topics: Topic[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
