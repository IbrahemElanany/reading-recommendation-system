import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ReadingIntervalResponseDto,
  ReadingIntervalErrorResponseDto,
} from '../../dto/responses/reading-interval-response.dto';

export const CreateReadingIntervalsSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Create reading intervals',
      description:
        "Create multiple reading intervals for books. This will track user's reading progress. All intervals must be for the same book and the end pages must be within the book's total pages.",
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Reading intervals created successfully',
      type: ReadingIntervalResponseDto,
      content: {
        'application/json': {
          example: {
            status: 'success',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error occurred',
      type: ReadingIntervalErrorResponseDto,
      content: {
        'application/json': {
          examples: {
            'Invalid Book': {
              value: {
                message: 'Book not found',
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            'Invalid Intervals': {
              value: {
                message: 'All intervals must be for the same book',
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            'Invalid Pages': {
              value: {
                message:
                  'Intervals end pages should be smaller than book pages',
                error: 'Bad Request',
                statusCode: 400,
              },
            },
            'General Error': {
              value: {
                message: 'Error creating reading intervals',
                error: 'Bad Request',
                statusCode: 400,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'User not authenticated',
      type: ReadingIntervalErrorResponseDto,
      content: {
        'application/json': {
          example: {
            message: 'Unauthorized',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'User does not have required role',
      type: ReadingIntervalErrorResponseDto,
      content: {
        'application/json': {
          example: {
            message: 'Forbidden resource',
            error: 'Forbidden',
            statusCode: 403,
          },
        },
      },
    }),
  );
};
