import { ExperienceType } from '@/experiences/types/experience.types';

/**
 * Job data for generating experience embedding
 */
export interface ExperienceEmbeddingJobData {
  experienceId: string;
  experienceType: ExperienceType;
  description: string;
}

/**
 * Job data for generating AIS Unit embedding
 */
export interface AisUnitEmbeddingJobData {
  aisUnitId: string;
  action: string;
  impact: string;
  context: string;
  skills?: string[];
}

/**
 * Job data for batch processing AIS Unit embeddings
 */
export interface AisUnitBatchEmbeddingJobData {
  units: Array<{
    aisUnitId: string;
    action: string;
    impact: string;
    context: string;
    skills?: string[];
  }>;
}

/**
 * Job data for processing job posting
 */
export interface JobPostingProcessingJobData {
  jobPostingId: string;
  rawText: string;
  userId: string;
}
