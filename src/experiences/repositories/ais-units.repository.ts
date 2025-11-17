import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, Repository, UpdateResult } from 'typeorm';

import { ExperienceType } from '@/experiences/types/experience.types';
import { AisUnit } from '@/experiences/entities/ais-unit.entity';

@Injectable()
export class AisUnitsRepository extends Repository<AisUnit> {
  constructor(private readonly dataSource: DataSource) {
    super(AisUnit, dataSource.createEntityManager());
  }

  findByExperience(experienceId: string, experienceType: ExperienceType): Promise<AisUnit[]> {
    return this.find({
      where: { experienceId, experienceType },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<AisUnit | null> {
    return this.findOne({ where: { id } });
  }

  async createUnit(payload: DeepPartial<AisUnit>): Promise<AisUnit> {
    const unit = this.create(payload);
    return this.save(unit);
  }

  async updateUnit(id: string, payload: DeepPartial<AisUnit>): Promise<AisUnit> {
    await super.update(id, payload);
    return this.findOneOrFail({ where: { id } });
  }

  async update(id: string, payload: DeepPartial<AisUnit>): Promise<UpdateResult> {
    return super.update(id, payload);
  }

  async deleteById(id: string): Promise<void> {
    await this.delete(id);
  }

  async deleteByExperience(experienceId: string, experienceType: ExperienceType): Promise<void> {
    await this.delete({ experienceId, experienceType });
  }

  async findWithSimilarity(
    userId: string,
    jobPostingEmbedding: number[],
    topK: number = 40,
  ): Promise<Array<AisUnit & { similarity: number; experienceId: string; experienceType: ExperienceType }>> {
    if (!jobPostingEmbedding || jobPostingEmbedding.length === 0) {
      return [];
    }

    // Convert embedding array to PostgreSQL vector format string
    // pgvector expects format: [0.1,0.2,0.3,...]
    const embeddingStr = `[${jobPostingEmbedding.join(',')}]`;

    // Use raw SQL query with pgvector cosine distance operator (<=>)
    // cosine similarity = 1 - cosine distance
    // The <=> operator returns cosine distance (0 = identical, 2 = opposite)
    const results = await this.dataSource.query(
      `
      SELECT 
        au.id,
        au."experienceType",
        au."experienceId",
        au.action,
        au.impact,
        au.context,
        au.skills,
        au."createdAt",
        au."updatedAt",
        (1 - (au.embedding <=> $1::vector)) as similarity
      FROM ais_units au
      INNER JOIN (
        SELECT id as experience_id, 'professional' as type FROM professional_experiences WHERE "userId" = $2
        UNION ALL
        SELECT id as experience_id, 'project' as type FROM project_experiences WHERE "userId" = $2
        UNION ALL
        SELECT id as experience_id, 'academic' as type FROM academic_experiences WHERE "userId" = $2
      ) user_experiences ON au."experienceId" = user_experiences.experience_id
      WHERE au.embedding IS NOT NULL
      ORDER BY au.embedding <=> $1::vector ASC
      LIMIT $3
    `,
      [embeddingStr, userId, topK],
    );

    return results.map((row: any) => {
      const unit = this.create({
        id: row.id,
        experienceType: row.experienceType,
        experienceId: row.experienceId,
        action: row.action,
        impact: row.impact,
        context: row.context,
        skills: row.skills,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
      return {
        ...unit,
        similarity: Number.parseFloat(row.similarity) || 0,
      };
    }) as Array<AisUnit & { similarity: number; experienceId: string; experienceType: ExperienceType }>;
  }
}
