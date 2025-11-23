import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, Repository } from 'typeorm';

import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';

@Injectable()
export class AcademicExperiencesRepository extends Repository<AcademicExperience> {
  constructor(private readonly dataSource: DataSource) {
    super(AcademicExperience, dataSource.createEntityManager());
  }

  findByUserId(userId: string): Promise<AcademicExperience[]> {
    return this.find({
      where: { userId },
      order: { startDate: 'DESC' },
    });
  }

  findByIdAndUserId(id: string, userId: string): Promise<AcademicExperience | null> {
    return this.findOne({ where: { id, userId } });
  }

  async createExperience(
    payload: DeepPartial<AcademicExperience>,
    userId: string,
  ): Promise<AcademicExperience> {
    const entity = this.create({ ...payload, userId });
    const saved = await this.save(entity);
    return this.findOneOrFail({ where: { id: saved.id, userId } });
  }

  async updateExperience(
    id: string,
    userId: string,
    payload: DeepPartial<AcademicExperience>,
  ): Promise<AcademicExperience> {
    await this.update({ id, userId }, payload);
    return this.findOneOrFail({ where: { id, userId } });
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.delete({ id, userId });
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
      `UPDATE academic_experiences SET ${updateFields.join(', ')}, "updatedAt" = NOW() WHERE id = $${params.length + 1} AND "userId" = $${params.length + 2}`,
      [...params, id, userId],
    );
  }
}
