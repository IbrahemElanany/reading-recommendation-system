import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateBookDto } from '../../dto/update-book.dto';

export const UpdateBookSwagger = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update a book', description: 'Updates a book by ID (Admin only)' }),
    ApiParam({ name: 'id', type: Number, description: 'Book ID' }),
    ApiBody({ type: UpdateBookDto, examples: {
      example: {
        summary: 'Update book',
        value: {
          title: 'The Great Gatsby (Updated)',
          numberOfPages: 200
        }
      }
    }}),
    ApiResponse({ status: 200, description: 'Book updated successfully', schema: { example: {
      book_id: '1',
      book_name: 'The Great Gatsby (Updated)',
      num_of_pages: '200',
      num_of_read_pages: '0'
    }}}),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error', schema: { example: { statusCode: 400, message: ['numberOfPages must be a positive integer'], error: 'Bad Request' }}}),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', schema: { example: { statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' }}}),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' }}}),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found', schema: { example: { statusCode: 404, message: 'Book not found', error: 'Not Found' }}}),
    ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server error occurred while updating the book', schema: { example: { statusCode: 500, message: 'Internal server error occurred', error: 'Internal Server Error' }}}),
  );
}; 