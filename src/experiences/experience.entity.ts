import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@/users/user.entity';

export enum ExperienceCategory {
  PROFESSIONAL = 'professional',
  EDUCATION = 'education',
  VOLUNTEER = 'volunteer',
  CERTIFICATION = 'certification',
  PROJECT = 'project',
}

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

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 