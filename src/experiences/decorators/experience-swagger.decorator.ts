import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { STATUS_CODES } from '@/common/types/status';
import { ExperienceResponseDto } from '@/experiences/dto/experience-response.dto';
import { CreateExperienceDto, CreateExperiencesDto } from '@/experiences/dto/create-experience.dto';

export function ApiCreateExperienceDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new experience' }),
    ApiBody({ type: CreateExperienceDto }),
    ApiResponse({ 
      status: STATUS_CODES.SUCCESSFUL.CREATED, 
      description: 'Experience created successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'User registered successfully' },
              statusCode: { type: 'number', example: STATUS_CODES.SUCCESSFUL.CREATED }
            }
          }
        ]
      }
    }),
    ApiResponse({ 
      status: STATUS_CODES.ERROR.BAD_REQUEST, 
      description: 'Bad request',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Bad request' },
              error: { type: 'string', example: 'Bad Request' },
              statusCode: { type: 'number', example: STATUS_CODES.ERROR.BAD_REQUEST }
            }
          }
        ]
      }
    }),
  );
}

export function ApiCreateBatchExperienceDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Create multiple experiences' }),
    ApiBody({ type: CreateExperiencesDto }),
    ApiExtraModels(ApiResponseDto),
    ApiResponse({ 
      status: STATUS_CODES.SUCCESSFUL.CREATED, 
      description: 'Experiences created successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Experiences created successfully' },
              statusCode: { type: 'number', example: STATUS_CODES.SUCCESSFUL.CREATED }
            }
          }
        ]
      }
    }),
    ApiResponse({ 
      status: STATUS_CODES.ERROR.BAD_REQUEST, 
      description: 'Bad request',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Bad request' },
              error: { type: 'string', example: 'Bad Request' },
              statusCode: { type: 'number', example: STATUS_CODES.ERROR.BAD_REQUEST }
            }
          }
        ]
      }
    }),
  );
}

export function ApiGetAllExperiencesDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all experiences' }),
    ApiExtraModels(ApiResponseDto, ExperienceResponseDto),
    ApiResponse({ 
      status: STATUS_CODES.SUCCESSFUL.OK, 
      description: 'Experiences retrieved successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(Array<ExperienceResponseDto>) } },
              message: { type: 'string', example: 'Experiences retrieved successfully' },
              statusCode: { type: 'number', example: STATUS_CODES.SUCCESSFUL.OK }
            }
          }
        ]
      }
    }),
    ApiResponse({
      status: STATUS_CODES.ERROR.BAD_REQUEST, 
      description: 'Bad request',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Bad request' },
              error: { type: 'string', example: 'Bad Request' },
              statusCode: { type: 'number', example: STATUS_CODES.ERROR.BAD_REQUEST }
            }
          }
        ]
      }
    }),
    ApiResponse({ 
      status: STATUS_CODES.ERROR.UNAUTHORIZED, 
      description: 'Unauthorized',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Unauthorized' },
              error: { type: 'string', example: 'Unauthorized' },
              statusCode: { type: 'number', example: STATUS_CODES.ERROR.UNAUTHORIZED }
            }
          }
        ]
      }
    }),
  );
}