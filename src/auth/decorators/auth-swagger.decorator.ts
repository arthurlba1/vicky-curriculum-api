import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

import { CreateUserDto } from '@/users/dto/create-user.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { STATUS_CODES } from '@/common/types/status';

export function ApiRegisterDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiBody({ type: CreateUserDto }),
    ApiExtraModels(AuthResponseDto, ApiResponseDto),
    ApiResponse({ 
      status: STATUS_CODES.SUCCESSFUL.CREATED, 
      description: 'User registered successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(AuthResponseDto) },
              message: { type: 'string', example: 'User registered successfully' },
              statusCode: { type: 'number', example: STATUS_CODES.SUCCESSFUL.CREATED }
            }
          }
        ]
      }
    }),
    ApiResponse({ 
      status: STATUS_CODES.ERROR.CONFLICT, 
      description: 'Email already exists',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Email already exists' },
              statusCode: { type: 'number', example: STATUS_CODES.ERROR.CONFLICT }
            }
          }
        ]
      }
    })
  );
}

export function ApiLoginDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Login user' }),
    ApiBody({ type: LoginDto }),
    ApiExtraModels(AuthResponseDto, ApiResponseDto),
    ApiResponse({ 
      status: STATUS_CODES.SUCCESSFUL.OK, 
      description: 'User logged in successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(AuthResponseDto) },
              message: { type: 'string', example: 'User logged in successfully' },
              statusCode: { type: 'number', example: STATUS_CODES.SUCCESSFUL.OK }
            }
          }
        ]
      }
    }),
    ApiResponse({ 
      status: STATUS_CODES.ERROR.UNAUTHORIZED, 
      description: 'Invalid credentials',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: { type: 'string', example: 'Invalid credentials' },
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
              statusCode: { type: 'number', example: STATUS_CODES.ERROR.NOT_FOUND }
            }
          }
        ]
      }
    })
  );
}

export function ApiGetMeDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current user profile' }),
    ApiExtraModels(UserResponseDto, ApiResponseDto),
    ApiResponse({ 
      status: STATUS_CODES.SUCCESSFUL.OK, 
      description: 'Current user profile',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(UserResponseDto) },
              message: { type: 'string', example: 'User profile fetched successfully' },
              statusCode: { type: 'number', example: STATUS_CODES.SUCCESSFUL.OK }
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
              statusCode: { type: 'number', example: STATUS_CODES.ERROR.NOT_FOUND }
            }
          }
        ]
      }
    })
  );
} 