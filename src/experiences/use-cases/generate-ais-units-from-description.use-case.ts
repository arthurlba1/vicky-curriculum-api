import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Observable, Observer } from 'rxjs';

import { UseCase } from '@/core/application/use-case.interface';
import { GenerateAisUnitsInput } from '@/experiences/dto/generate-ais-units.input';
import { GeneratedAisUnitDto } from '@/experiences/dto/generate-ais-units.response';
import { generateAisUnitsSystemPrompt } from '@/experiences/prompts/generate-ais-units.prompt';
import { IncrementalJsonParser } from '@/experiences/utils/incremental-json-parser';
import { AisUnitValidator } from '@/experiences/utils/ais-unit-validator';
import { StreamStateManager } from '@/experiences/utils/stream-state-manager';

export interface GenerateAisUnitsUseCaseInput extends GenerateAisUnitsInput {
  userId: string;
}

/**
 * Use case for generating AIS units from raw experience descriptions
 * Uses streaming to provide real-time results as they are generated
 * 
 * Guarantees:
 * - Only complete, valid objects are emitted
 * - No duplicate emissions
 * - Robust error handling
 * - Real-time streaming as objects become available
 */
@Injectable()
export class GenerateAisUnitsFromDescriptionUseCase
  implements UseCase<GenerateAisUnitsUseCaseInput, Observable<GeneratedAisUnitDto>>
{
  private readonly logger = new Logger(GenerateAisUnitsFromDescriptionUseCase.name);
  private readonly openai: OpenAI;
  private readonly llmModel = 'gpt-4o-mini';
  private readonly temperature = 0.3;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Execute the use case - returns an Observable that streams AIS units
   * Guarantees that only complete, valid objects are emitted
   */
  execute(
    input: GenerateAisUnitsUseCaseInput,
  ): Observable<GeneratedAisUnitDto> {
    return new Observable((observer: Observer<GeneratedAisUnitDto>) => {
      this.processStream(input, observer)
        .then(() => {
          this.logger.debug(`Stream completed for user ${input.userId}`);
          observer.complete();
        })
        .catch((error) => {
          this.logger.error(
            `Stream error for user ${input.userId}: ${error.message}`,
            error.stack,
          );
          observer.error(error);
        });
    });
  }

  /**
   * Process the OpenAI stream and emit complete AIS units
   * Uses modern streaming patterns with incremental parsing
   */
  private async processStream(
    input: GenerateAisUnitsUseCaseInput,
    observer: Observer<GeneratedAisUnitDto>,
  ): Promise<void> {
    this.logger.log(`Starting AIS units generation stream for user ${input.userId}`);

    const parser = new IncrementalJsonParser<Partial<GeneratedAisUnitDto>>();
    const stateManager = new StreamStateManager();

    try {
      const stream = await this.createOpenAiStream(input);

      let chunkCount = 0;
      let totalParsedDuringStream = 0;
      let totalEmittedDuringStream = 0;

      // Process stream chunks incrementally
      for await (const chunk of stream) {
        const content = this.extractContentFromChunk(chunk);
        if (!content) {
          continue;
        }

        chunkCount++;

        // Parse incremental JSON and extract complete objects
        const parsedObjects = parser.append(content);
        totalParsedDuringStream += parsedObjects.length;
        
        if (parsedObjects.length > 0) {
          this.logger.debug(
            `Chunk ${chunkCount}: Parsed ${parsedObjects.length} objects incrementally`,
          );
        }
        
        // Validate and filter only valid AIS units
        const validUnits = AisUnitValidator.validateBatch(parsedObjects);
        
        if (parsedObjects.length !== validUnits.length) {
          this.logger.warn(
            `Chunk ${chunkCount}: ${parsedObjects.length - validUnits.length} objects failed validation`,
          );
        }
        
        // Get only new units that haven't been emitted
        const newUnits = stateManager.getNewUnits(validUnits);
        totalEmittedDuringStream += newUnits.length;
        
        // Emit each new unit
        for (const unit of newUnits) {
          this.logger.debug(
            `Emitting AIS unit during stream: ${unit.action.substring(0, 60)}...`,
          );
          observer.next(unit);
        }
      }

      this.logger.debug(
        `Stream processing complete: ${chunkCount} chunks, ${totalParsedDuringStream} parsed during stream, ${totalEmittedDuringStream} emitted during stream`,
      );

      // Finalize parsing to get any remaining complete objects
      const finalObjects = parser.finalize();
      this.logger.debug(`Final parse extracted ${finalObjects.length} objects`);
      
      const finalValidUnits = AisUnitValidator.validateBatch(finalObjects);
      this.logger.debug(`Final validation: ${finalValidUnits.length} valid units`);
      
      const finalNewUnits = stateManager.getNewUnits(finalValidUnits);
      this.logger.debug(`Final new units to emit: ${finalNewUnits.length}`);

      for (const unit of finalNewUnits) {
        observer.next(unit);
      }

      const totalEmitted = stateManager.getEmittedCount();
      this.logger.log(
        `Successfully streamed ${totalEmitted} AIS units for user ${input.userId}`,
      );
      
      // Log warning if too few units
      if (totalEmitted < 4) {
        this.logger.warn(
          `Only ${totalEmitted} AIS units were generated. Expected at least 4. ` +
          `This might indicate the LLM didn't follow instructions or parsing issues.`,
        );
        
        // Log detailed buffer information
        const rawBuffer = parser.getBufferContent();
        const cleanedBuffer = parser.getCleanedBuffer();
        this.logger.debug(`Raw buffer size: ${rawBuffer.length} characters`);
        this.logger.debug(`Cleaned buffer size: ${cleanedBuffer.length} characters`);
        
        if (cleanedBuffer.length > 0) {
          this.logger.debug(`Cleaned buffer preview (first 1000 chars): ${cleanedBuffer.substring(0, 1000)}`);
          this.logger.debug(`Cleaned buffer preview (last 500 chars): ${cleanedBuffer.substring(Math.max(0, cleanedBuffer.length - 500))}`);
          
          // Try to parse the full buffer to see what we got
          try {
            const fullParse = JSON.parse(cleanedBuffer);
            if (fullParse.aisUnits && Array.isArray(fullParse.aisUnits)) {
              this.logger.warn(
                `Full parse found ${fullParse.aisUnits.length} units in aisUnits array. ` +
                `Incremental parser extracted ${totalEmitted} units. ` +
                `This suggests the incremental parser may have missed ${fullParse.aisUnits.length - totalEmitted} units.`,
              );
            } else if (Array.isArray(fullParse)) {
              this.logger.warn(
                `Full parse found ${fullParse.length} units in direct array. ` +
                `Incremental parser extracted ${totalEmitted} units. ` +
                `This suggests the incremental parser may have missed ${fullParse.length - totalEmitted} units.`,
              );
            }
          } catch (parseError) {
            this.logger.debug(`Could not parse full buffer: ${parseError.message}`);
            this.logger.debug(`Buffer might be incomplete. Last 200 chars: ${cleanedBuffer.substring(Math.max(0, cleanedBuffer.length - 200))}`);
          }
        } else {
          this.logger.warn(
            `Buffer is empty! This suggests objects were extracted during streaming but buffer was cleared. ` +
            `Total emitted during stream: ${totalEmittedDuringStream}, Total emitted final: ${totalEmitted}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to process stream for user ${input.userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create OpenAI streaming request
   */
  private async createOpenAiStream(input: GenerateAisUnitsUseCaseInput) {
    return this.openai.chat.completions.create({
      model: this.llmModel,
      messages: [
        { role: 'system', content: generateAisUnitsSystemPrompt },
        {
          role: 'user',
          content: `Experience Description:\n\n${input.rawExperienceDescription}`,
        },
      ],
      temperature: this.temperature,
      stream: true,
    });
  }

  /**
   * Extract content from OpenAI stream chunk
   */
  private extractContentFromChunk(
    chunk: OpenAI.Chat.Completions.ChatCompletionChunk,
  ): string {
    return chunk.choices[0]?.delta?.content || '';
  }
}
