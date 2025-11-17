import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, Repository, UpdateResult } from 'typeorm';

import { JobPosting } from '../entities/job-posting.entity';

@Injectable()
export class JobPostingsRepository extends Repository<JobPosting> {
  constructor(private readonly dataSource: DataSource) {
    super(JobPosting, dataSource.createEntityManager());
  }

  findByUserId(userId: string): Promise<JobPosting[]> {
    return this.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findByIdAndUserId(id: string, userId: string): Promise<JobPosting | null> {
    return this.findOne({ where: { id, userId } });
  }

  async createJobPosting(
    payload: DeepPartial<JobPosting>,
    userId: string,
  ): Promise<JobPosting> {
    const entity = this.create({ ...payload, userId });
    const saved = await this.save(entity);
    return this.findOneOrFail({ where: { id: saved.id, userId } });
  }

  async updateJobPosting(
    id: string,
    userId: string,
    payload: DeepPartial<JobPosting>,
  ): Promise<JobPosting> {
    await super.update({ id, userId }, payload);
    return this.findOneOrFail({ where: { id, userId } });
  }

  async update(
    criteria: { id: string; userId: string },
    payload: DeepPartial<JobPosting>,
  ): Promise<UpdateResult> {
    return super.update(criteria, payload);
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.delete({ id, userId });
  }
}
