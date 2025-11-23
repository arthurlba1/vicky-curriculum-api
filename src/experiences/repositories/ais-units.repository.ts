import { Injectable, Logger } from '@nestjs/common';
import { DataSource, DeepPartial, Repository, UpdateResult } from 'typeorm';

import { ExperienceType } from '@/experiences/types/experience.types';
import { AisUnit } from '@/experiences/entities/ais-unit.entity';

@Injectable()
export class AisUnitsRepository extends Repository<AisUnit> {
  private readonly logger = new Logger(AisUnitsRepository.name);

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

  /**
   * Update embedding using raw SQL to avoid TypeORM escaping issues with vector type
   */
  async updateEmbedding(id: string, embedding: number[], embeddingModel?: string): Promise<void> {
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
      `UPDATE ais_units SET ${updateFields.join(', ')}, "updatedAt" = NOW() WHERE id = $${params.length + 1}`,
      [...params, id],
    );
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
      this.logger.warn('Job posting embedding is empty or null');
      return [];
    }

    // Validate and sanitize embedding values (remove NaN, Infinity, null, undefined)
    const validEmbedding = jobPostingEmbedding
      .map((val) => {
        const num = Number(val);
        if (Number.isNaN(num) || !Number.isFinite(num)) {
          return 0;
        }
        return num;
      })
      .filter((val) => val !== null && val !== undefined);

    if (validEmbedding.length === 0) {
      this.logger.warn('Valid embedding length is 0 after sanitization');
      return [];
    }

    this.logger.log(`Searching for AIS units with similarity for userId: ${userId}, embedding length: ${validEmbedding.length}, topK: ${topK}`);

    // Diagnostic query to check AIS units availability
    try {
      const diagnosticResults = await this.dataSource.query(
        `
        SELECT 
          COUNT(*) as total_ais_units,
          COUNT(au.embedding) as ais_units_with_embedding,
          COUNT(DISTINCT au."experienceId") as unique_experiences
        FROM ais_units au
        INNER JOIN (
          SELECT id::text as experience_id FROM professional_experiences WHERE "userId"::text = $1::text
          UNION ALL
          SELECT id::text as experience_id FROM project_experiences WHERE "userId"::text = $1::text
          UNION ALL
          SELECT id::text as experience_id FROM academic_experiences WHERE "userId"::text = $1::text
        ) user_experiences ON au."experienceId" = user_experiences.experience_id
      `,
        [userId],
      );

      if (diagnosticResults && diagnosticResults.length > 0) {
        const diag = diagnosticResults[0];
        this.logger.log(
          `Diagnostic - Total AIS units: ${diag.total_ais_units}, With embedding: ${diag.ais_units_with_embedding}, Unique experiences: ${diag.unique_experiences}`,
        );
      }
    } catch (diagError) {
      this.logger.warn(`Failed to run diagnostic query: ${diagError.message}`);
    }

    // Convert embedding array to PostgreSQL vector format string
    // pgvector expects format: [0.1,0.2,0.3,...]
    const embeddingStr = `[${validEmbedding.join(',')}]`;

    try {
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
          (1 - (au.embedding::vector <=> $1::vector)) as similarity
        FROM ais_units au
        INNER JOIN (
          SELECT id::text as experience_id, 'professional' as type FROM professional_experiences WHERE "userId"::text = $2::text
          UNION ALL
          SELECT id::text as experience_id, 'project' as type FROM project_experiences WHERE "userId"::text = $2::text
          UNION ALL
          SELECT id::text as experience_id, 'academic' as type FROM academic_experiences WHERE "userId"::text = $2::text
        ) user_experiences ON au."experienceId" = user_experiences.experience_id
        WHERE au.embedding IS NOT NULL
        ORDER BY au.embedding::vector <=> $1::vector ASC
        LIMIT $3
      `,
        [embeddingStr, userId, topK],
      );

      this.logger.log(`Query returned ${results.length} results`);

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
    } catch (error) {
      this.logger.error(`Error in findWithSimilarity query: ${error.message}`, error.stack);
      throw error;
    }
  }
}
