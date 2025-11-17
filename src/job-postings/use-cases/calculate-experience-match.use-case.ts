import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { JobPostingsRepository } from '../repositories/job-postings.repository';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceMatchResponse } from '../dto/experience-match.response';
import { ExperienceType } from '@/experiences/types/experience.types';
import { mapExperienceToSummary } from '@/experiences/mappers/experience.mapper';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';

export interface CalculateExperienceMatchInput {
  jobPostingId: string;
  userId: string;
  topK?: number;
}

@Injectable()
export class CalculateExperienceMatchUseCase
  implements UseCase<CalculateExperienceMatchInput, ExperienceMatchResponse[]>
{
  private readonly SKILL_BOOST_FACTOR = 1.5; // Boost multiplier for explicit skill matches
  private readonly DEFAULT_TOP_K = 40;
  private readonly MIN_SIMILARITY_THRESHOLD = 0.3; // Minimum similarity to consider a match

  constructor(
    private readonly jobPostingsRepository: JobPostingsRepository,
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
  ) {}

  async execute(
    input: CalculateExperienceMatchInput,
  ): Promise<ExperienceMatchResponse[]> {
    const { jobPostingId, userId, topK = this.DEFAULT_TOP_K } = input;

    const jobPosting = await this.jobPostingsRepository.findByIdWithEmbedding(
      jobPostingId,
      userId,
    );

    if (!jobPosting) {
      throw new NotFoundException('Job posting not found');
    }

    if (!jobPosting.embedding || jobPosting.embedding.length === 0) {
      throw new BadRequestException(
        'Job posting embedding not yet generated. Please wait for processing to complete.',
      );
    }

    const jobPostingSkills = this.extractJobPostingSkills(jobPosting.summaryJson);

    const aisUnitsWithSimilarity =
      await this.aisUnitsRepository.findWithSimilarity(
        userId,
        jobPosting.embedding,
        topK,
      );

    const experienceScores = this.calculateExperienceScores(
      aisUnitsWithSimilarity,
      jobPostingSkills,
    );

    const allExperiences = await this.getAllUserExperiences(userId);

    const rawScores = Array.from(experienceScores.values()).map((s) => s.score);
    const maxScore = rawScores.length > 0 ? Math.max(...rawScores, 0) : 0;
    const minScore = rawScores.length > 0 ? Math.min(...rawScores, 0) : 0;
    const scoreRange = maxScore - minScore || 1;

    const experienceMatches = allExperiences.map((exp) => {
      const scoreData = experienceScores.get(exp.id) || {
        score: 0,
        compatibleSkills: [],
      };

      const normalizedScore =
        maxScore > 0 && scoreRange > 0
          ? ((scoreData.score - minScore) / scoreRange) * 100
          : 0;

      const experienceSummary = mapExperienceToSummary(exp.type, exp.experience);

      return {
        experienceId: exp.id,
        userId: exp.userId,
        experienceType: exp.type,
        matchScore: Math.round(normalizedScore * 100) / 100,
        experience: experienceSummary.payload,
        compatibleSkills: scoreData.compatibleSkills,
        createdAt: exp.experience.createdAt,
        updatedAt: exp.experience.updatedAt,
      } as ExperienceMatchResponse;
    });

    return experienceMatches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private extractJobPostingSkills(
    summaryJson?: Record<string, unknown>,
  ): Set<string> {
    const skills = new Set<string>();

    if (!summaryJson) {
      return skills;
    }

    const requiredSkills = (summaryJson.requiredSkills as string[]) || [];
    const preferredSkills = (summaryJson.preferredSkills as string[]) || [];

    [...requiredSkills, ...preferredSkills].forEach((skill) => {
      if (typeof skill === 'string' && skill.trim()) {
        skills.add(skill.trim().toLowerCase());
      }
    });

    return skills;
  }

  private calculateExperienceScores(
    aisUnitsWithSimilarity: Array<{
      similarity: number;
      skills?: string[];
      experienceId: string;
      experienceType?: ExperienceType;
    }>,
    jobPostingSkills: Set<string>,
  ): Map<string, { score: number; compatibleSkills: string[] }> {
    const experienceScores = new Map<
      string,
      { score: number; compatibleSkills: Set<string> }
    >();

    for (const unit of aisUnitsWithSimilarity) {
      if (unit.similarity < this.MIN_SIMILARITY_THRESHOLD) {
        continue;
      }

      const experienceId = unit.experienceId;
      if (!experienceId) {
        continue;
      }

      if (!experienceScores.has(experienceId)) {
        experienceScores.set(experienceId, {
          score: 0,
          compatibleSkills: new Set<string>(),
        });
      }

      const expScore = experienceScores.get(experienceId)!;

      let weight = 1.0;
      const unitSkills = (unit.skills || []).map((s) => s.trim().toLowerCase());
      let hasSkillMatch = false;

      for (const skill of unitSkills) {
        if (jobPostingSkills.has(skill)) {
          hasSkillMatch = true;
          expScore.compatibleSkills.add(skill);
        }
      }

      if (hasSkillMatch) {
        weight = this.SKILL_BOOST_FACTOR;
      }

      const similarityScore = Math.max(0, unit.similarity);
      expScore.score += similarityScore * weight;

      unitSkills.forEach((skill) => expScore.compatibleSkills.add(skill));
    }

    const result = new Map<string, { score: number; compatibleSkills: string[] }>();
    for (const [experienceId, data] of experienceScores.entries()) {
      result.set(experienceId, {
        score: data.score,
        compatibleSkills: Array.from(data.compatibleSkills),
      });
    }

    return result;
  }

  private async getAllUserExperiences(
    userId: string,
  ): Promise<
    Array<{
      id: string;
      userId: string;
      type: ExperienceType;
      experience: ProfessionalExperience | ProjectExperience | AcademicExperience;
    }>
  > {
    const [professional, project, academic] = await Promise.all([
      this.experienceRepositoryFactory
        .getRepository(ExperienceType.PROFESSIONAL)
        .findByUserId(userId),
      this.experienceRepositoryFactory
        .getRepository(ExperienceType.PROJECT)
        .findByUserId(userId),
      this.experienceRepositoryFactory
        .getRepository(ExperienceType.ACADEMIC)
        .findByUserId(userId),
    ]);

    return [
      ...professional.map((exp) => ({
        id: exp.id,
        userId: exp.userId,
        type: ExperienceType.PROFESSIONAL as ExperienceType,
        experience: exp,
      })),
      ...project.map((exp) => ({
        id: exp.id,
        userId: exp.userId,
        type: ExperienceType.PROJECT as ExperienceType,
        experience: exp,
      })),
      ...academic.map((exp) => ({
        id: exp.id,
        userId: exp.userId,
        type: ExperienceType.ACADEMIC as ExperienceType,
        experience: exp,
      })),
    ];
  }
}
