import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * Service responsible for generating embeddings using OpenAI
 */
@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly openai: OpenAI;
  private readonly defaultModel = 'text-embedding-3-small';
  private readonly defaultDimensions = 1536;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate embedding for a single text
   * @param text Text to generate embedding for
   * @param model Optional model to use (default: text-embedding-3-small)
   * @returns Promise resolving to embedding vector and model name
   */
  async generateEmbedding(
    text: string,
    model?: string,
  ): Promise<{ embedding: number[]; model: string }> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const embeddingModel = model || this.defaultModel;

    try {
      const response = await this.openai.embeddings.create({
        model: embeddingModel,
        input: text,
        dimensions: this.defaultDimensions,
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new Error('Failed to generate embedding: empty response');
      }

      return {
        embedding,
        model: embeddingModel,
      };
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts Array of texts to generate embeddings for
   * @param model Optional model to use (default: text-embedding-3-small)
   * @returns Promise resolving to array of embedding vectors and model name
   */
  async generateEmbeddingsBatch(
    texts: string[],
    model?: string,
  ): Promise<{ embeddings: number[][]; model: string }> {
    if (!texts || texts.length === 0) {
      throw new Error('Texts array cannot be empty');
    }

    // Filter out empty texts
    const validTexts = texts.filter((text) => text && text.trim().length > 0);
    if (validTexts.length === 0) {
      throw new Error('No valid texts to generate embeddings for');
    }

    const embeddingModel = model || this.defaultModel;

    try {
      const response = await this.openai.embeddings.create({
        model: embeddingModel,
        input: validTexts,
        dimensions: this.defaultDimensions,
      });

      const embeddings = response.data.map((item) => item.embedding);
      if (embeddings.length !== validTexts.length) {
        throw new Error('Mismatch between input texts and generated embeddings');
      }

      return {
        embeddings,
        model: embeddingModel,
      };
    } catch (error) {
      this.logger.error(`Failed to generate embeddings batch: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Unify AIS Unit JSON into a single text for embedding generation
   * @param aisUnit AIS Unit object
   * @returns Unified text representation
   */
  unifyAisUnitToText(aisUnit: {
    action: string;
    impact: string;
    context: string;
    skills?: string[];
  }): string {
    const parts: string[] = [];

    if (aisUnit.action) {
      parts.push(`Action: ${aisUnit.action}`);
    }

    if (aisUnit.context) {
      parts.push(`Context: ${aisUnit.context}`);
    }

    if (aisUnit.impact) {
      parts.push(`Impact: ${aisUnit.impact}`);
    }

    if (aisUnit.skills && aisUnit.skills.length > 0) {
      parts.push(`Skills: ${aisUnit.skills.join(', ')}`);
    }

    return parts.join('. ');
  }
}

