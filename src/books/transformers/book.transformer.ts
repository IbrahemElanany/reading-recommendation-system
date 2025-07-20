import { ApiProperty } from '@nestjs/swagger';
import { Book } from '@prisma/client';

export class BookTransformer {
  @ApiProperty({
    description: 'The ID of the book',
    example: '1',
  })
  book_id: string;

  @ApiProperty({
    description: 'The name of the book',
    example: 'The Great Gatsby',
  })
  book_name: string;

  @ApiProperty({
    description: 'Total number of pages in the book',
    example: '180',
  })
  num_of_pages: string;

  @ApiProperty({
    description: 'Total number of unique pages read in the book',
    example: '50',
    required: false,
    default: '0',
  })
  num_of_read_pages: string;

  /**
   * Transforms a Book entity (from Prisma) or a raw book-like object into a standardized DTO.
   * Handles both DB entity and preformatted data.
   */
  static fromBook(book: Book | Partial<BookTransformer>): BookTransformer {
    const transformer = new BookTransformer();

    if ('id' in book && 'title' in book && 'numberOfPages' in book) {
      transformer.book_id = String(book.id);
      transformer.book_name = book.title;
      transformer.num_of_pages = String(book.numberOfPages);
      transformer.num_of_read_pages = '0';
    } else {
      transformer.book_id = String(book.book_id ?? 0);
      transformer.book_name = book.book_name ?? '';
      transformer.num_of_pages = String(book.num_of_pages ?? 0);
      transformer.num_of_read_pages = String(book.num_of_read_pages ?? 0);
    }

    return transformer;
  }
}