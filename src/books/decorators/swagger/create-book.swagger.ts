import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { CreateBookResponseDto } from '../../dto/responses/create-book-response.dto';

export const CreateBookSwagger = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new book',
      description: 'Creates a new book in the system (Admin only)',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Book created successfully',
      type: CreateBookResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'Invalid input data',
          },
          error: {
            type: 'string',
            example: 'Bad Request',
          },
          statusCode: {
            type: 'number',
            example: 400,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User is not authenticated',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'Unauthorized',
          },
          statusCode: {
            type: 'number',
            example: 401,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'User is not authorized to create books',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'Forbidden resource',
          },
          statusCode: {
            type: 'number',
            example: 403,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Server error occurred while creating the book',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'Internal server error occurred',
          },
          error: {
            type: 'string',
            example: 'Internal Server Error',
          },
          statusCode: {
            type: 'number',
            example: 500,
          },
        },
      },
    }),
  );
};
