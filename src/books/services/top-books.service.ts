import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookTransformer } from '../transformers/book.transformer';

@Injectable()
export class TopBooksService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopBooks(limit = 5): Promise<BookTransformer[]> {
    // Use a raw SQL query to efficiently calculate unique pages read per book
    const results = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT
        b.id AS book_id,
        b.title AS book_name,
        b."number_of_pages" AS num_of_pages,
        COUNT(DISTINCT gs.page) AS num_of_read_pages
      FROM books b
      LEFT JOIN (
        SELECT
          book_id,
          generate_series(start_page, end_page) AS page
        FROM reading_intervals
      ) gs ON gs.book_id = b.id
      GROUP BY b.id
      ORDER BY num_of_read_pages DESC
      LIMIT $1
    `, limit);

    return results.map(row => ({
      book_id: String(row.book_id),
      book_name: row.book_name,
      num_of_pages: String(row.num_of_pages),
      num_of_read_pages: String(row.num_of_read_pages),
    }));
  }
}
