import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { STATUS_CODES } from '@/common/types/status';
import { UserResponseDto } from '@/users/dto/user-response.dto';

export function ApiGetAllUsersDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users' }),
    ApiExtraModels(ApiResponseDto, UserResponseDto),
    ApiResponse({ 
      status: STATUS_CODES.SUCCESSFUL.OK, 
      description: 'List of all users',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(UserResponseDto) } },
              message: { type: 'string', example: 'Users retrieved successfully' },
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
    })
  );
}


export function ApiGetUserByIdDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by ID' }),
    ApiExtraModels(ApiResponseDto, UserResponseDto),
    ApiResponse({ 
      status: STATUS_CODES.SUCCESSFUL.OK, 
      description: 'User found',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(UserResponseDto) },
              message: { type: 'string', example: 'User retrieved successfully' },
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
    ApiResponse({ 
      status: STATUS_CODES.ERROR.NOT_FOUND, 
      description: 'User not found',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
              statusCode: { type: 'number', example: STATUS_CODES.ERROR.NOT_FOUND }
            }
          }
        ]
      }
    })
  );
}

export function ApiDeleteUserByIdDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete user by ID' }),
    ApiExtraModels(ApiResponseDto, UserResponseDto),
    ApiResponse({ 
      status: STATUS_CODES.SUCCESSFUL.OK, 
      description: 'User deleted successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'User deleted successfully' },
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
    ApiResponse({ 
      status: STATUS_CODES.ERROR.NOT_FOUND, 
      description: 'User not found',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
              statusCode: { type: 'number', example: STATUS_CODES.ERROR.NOT_FOUND }
            }
          }
        ]
      }
    })
  );
}
