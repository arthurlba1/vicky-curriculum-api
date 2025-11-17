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

@Entity('professional_experiences')
export class ProfessionalExperience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  companyName: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', nullable: true })
  generalDescription?: string;

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
