import { ApiProperty } from '@nestjs/swagger';
import { BookTransformer } from '../../transformers/book.transformer';

export class TopBooksResponseDto {
  @ApiProperty({
    description: 'List of top rated books',
    type: [BookTransformer],
    isArray: true,
    example: [
      {
        book_id: '1',
        book_name: 'The Great Gatsby',
        num_of_pages: '180',
        num_of_read_pages: '50',
      },
    ],
  })
  books: BookTransformer[];
}
