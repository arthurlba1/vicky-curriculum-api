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

  async findByIdWithEmbedding(id: string, userId: string): Promise<JobPosting | null> {
    return this.findOne({
      where: { id, userId },
      select: ['id', 'userId', 'rawText', 'status', 'embedding', 'embeddingModel', 'summaryJson'],
    });
  }

  /**
   * Update embedding using raw SQL to avoid TypeORM escaping issues with vector type
   */
  async updateEmbedding(
    id: string,
    userId: string,
    embedding: number[],
    embeddingModel?: string,
  ): Promise<void> {
    if (!embedding || embedding.length === 0) {
      return;
    }

    // Validate and sanitize embedding values
    const validEmbedding = embedding
      .map((val) => {
        const num = Number(val);
        if (Number.isNaN(num) || !Number.isFinite(num)) {
          return 0;
        }
        return num;
      })
      .filter((val) => val !== null && val !== undefined);

    if (validEmbedding.length === 0) {
      return;
    }

    // Convert to pgvector format: [0.1,0.2,0.3]
    const embeddingStr = `[${validEmbedding.join(',')}]`;

    // Use raw SQL to update embedding directly
    const updateFields: string[] = [`embedding = $1::vector`];
    const params: any[] = [embeddingStr];

    if (embeddingModel) {
      updateFields.push(`"embeddingModel" = $${params.length + 1}`);
      params.push(embeddingModel);
    }

    await this.dataSource.query(
      `UPDATE job_postings SET ${updateFields.join(', ')}, "updatedAt" = NOW() WHERE id = $${params.length + 1} AND "userId" = $${params.length + 2}`,
      [...params, id, userId],
    );
  }
}
