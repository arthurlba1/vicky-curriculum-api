import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * Service responsible for generating embeddings using OpenAI
 */

/**
 * Embedding dimensions for the OpenAI models, Use the same dimensions for both models to ensure compatibility in cosine similarity
 */
const EMBEDDING_DIMENSIONS = 1536;

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly openai: OpenAI;
  private readonly defaultModel = 'text-embedding-3-small';
  private readonly largeModel = 'text-embedding-3-large';
  private readonly embeddingDimensions = EMBEDDING_DIMENSIONS;

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
        dimensions: this.embeddingDimensions,
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
        dimensions: this.embeddingDimensions,
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
}
