import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TopBooksResponseDto } from '../../dto/responses/top-books-response.dto';

export const TopBooksSwagger = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get top rated books',
      description: 'Retrieves a list of top rated books (User access required)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully retrieved top books',
      type: TopBooksResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Error occurred while fetching top books',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'Error getting top books',
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
      description: 'User is not authorized to access top books',
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
  );
};
