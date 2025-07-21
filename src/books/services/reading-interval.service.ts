import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from '../constants';
import { Queue } from 'bullmq';
import { Book } from '@prisma/client';
import { SingleIntervalDto } from '../dto/single-interval.dto';
import { TopBooksService } from './top-books.service';
import { LoggerService } from 'src/logger/logger.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ReadingIntervalService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(BOOKS_CALCULATE_READING_INTERVAL_QUEUE)
    private readonly calculateReadingIntervalQueue: Queue,
    private readonly topBooksService: TopBooksService,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Submit a single reading interval for a book (one by one)
   * Handles duplicate intervals gracefully (idempotent).
   * @param dto - SingleIntervalDto with userId
   */
  async submitSingleInterval(dto: SingleIntervalDto & { userId: number }): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Validate book exists
      const book = await this.prisma.book.findUnique({ where: { id: dto.bookId } });
      if (!book) {
        throw new BadRequestException('Book not found');
      }
      
      // Validate page range
      if (dto.startPage < 1 || dto.endPage < dto.startPage || dto.endPage > book.numberOfPages) {
        throw new BadRequestException('Invalid page range');
      }
      
      // Check for duplicate interval
      const exists = await this.prisma.readingInterval.findFirst({
        where: {
          userId: dto.userId,
          bookId: dto.bookId,
          startPage: dto.startPage,
          endPage: dto.endPage,
        },
      });
      
      if (exists) {
        // Idempotent: do nothing if already exists
        this.logger.debug(`Duplicate interval detected for user ${dto.userId}, book ${dto.bookId}`, ReadingIntervalService.name);
        return;
      }
      
      // Insert the interval within a transaction
      await this.prisma.$transaction(async (tx) => {
        await tx.readingInterval.create({
          data: {
            startPage: dto.startPage,
            endPage: dto.endPage,
            bookId: dto.bookId,
            userId: dto.userId,
          },
        });
        
        // Invalidate cache immediately for real-time updates
        await this.invalidateRelatedCache(dto.bookId);
      });
      
      // Queue background job for analytics/reporting
      await this.queueAnalyticsJob(dto);
      
      const duration = Date.now() - startTime;
      this.logger.log(
        `Reading interval submitted successfully in ${duration}ms - User: ${dto.userId}, Book: ${dto.bookId}, Pages: ${dto.startPage}-${dto.endPage}`,
        ReadingIntervalService.name
      );
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to submit reading interval after ${duration}ms - User: ${dto.userId}, Book: ${dto.bookId}, Error: ${error.message}`,
        error.stack,
        ReadingIntervalService.name
      );
      throw error;
    }
  }

  /**
   * Submit multiple reading intervals in batch
   * @param intervals - Array of intervals with userId
   */
  async submitBatchIntervals(intervals: (SingleIntervalDto & { userId: number })[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ index: number; error: string }>,
    };

    // Process in batches to avoid overwhelming the database
    const BATCH_SIZE = 50;
    for (let i = 0; i < intervals.length; i += BATCH_SIZE) {
      const batch = intervals.slice(i, i + BATCH_SIZE);
      
      await Promise.allSettled(
        batch.map(async (interval, batchIndex) => {
          try {
            await this.submitSingleInterval(interval);
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push({
              index: i + batchIndex,
              error: error.message,
            });
          }
        })
      );
    }

    this.logger.log(
      `Batch interval submission completed - Success: ${results.success}, Failed: ${results.failed}`,
      ReadingIntervalService.name
    );

    return results;
  }

  /**
   * Get reading statistics for a user
   */
  async getUserReadingStats(userId: number): Promise<{
    totalBooksRead: number;
    totalPagesRead: number;
    averagePagesPerBook: number;
    readingStreak: number;
    favoriteBooks: Array<{ bookId: number; pagesRead: number; bookTitle: string }>;
  }> {
    const [totalStats, favoriteBooks] = await Promise.all([
      this.getUserTotalStats(userId),
      this.getUserFavoriteBooks(userId),
    ]);

    return {
      ...totalStats,
      favoriteBooks,
    };
  }

  private async getUserTotalStats(userId: number) {
    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        COUNT(DISTINCT book_id) as total_books,
        COUNT(DISTINCT gs.page) as total_pages
      FROM reading_intervals ri
      CROSS JOIN LATERAL generate_series(ri.start_page, ri.end_page) AS gs(page)
      WHERE ri.user_id = $1
    `, userId);

    const stats = result[0];
    return {
      totalBooksRead: Number(stats.total_books || 0),
      totalPagesRead: Number(stats.total_pages || 0),
      averagePagesPerBook: stats.total_books > 0 ? Number(stats.total_pages) / Number(stats.total_books) : 0,
      readingStreak: await this.calculateReadingStreak(userId),
    };
  }

  private async getUserFavoriteBooks(userId: number, limit = 5) {
    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        ri.book_id,
        b.title as book_title,
        COUNT(DISTINCT gs.page) as pages_read
      FROM reading_intervals ri
      JOIN books b ON b.id = ri.book_id
      CROSS JOIN LATERAL generate_series(ri.start_page, ri.end_page) AS gs(page)
      WHERE ri.user_id = $1
      GROUP BY ri.book_id, b.title
      ORDER BY pages_read DESC
      LIMIT $2
    `, userId, limit);

    return result.map(row => ({
      bookId: Number(row.book_id),
      pagesRead: Number(row.pages_read),
      bookTitle: row.book_title,
    }));
  }

  private async calculateReadingStreak(userId: number): Promise<number> {
    // This is a simplified implementation
    // In a real system, you'd track daily reading activity
    const result = await this.prisma.readingInterval.count({
      where: { userId },
    });
    
    // For demo purposes, return a mock streak
    return Math.min(result, 7);
  }

  private async invalidateRelatedCache(bookId: number): Promise<void> {
    try {
      // Invalidate top books cache
      await this.topBooksService.invalidateCache();
      
      // Invalidate user-specific cache
      const userCacheKeys = await this.getUserCacheKeys(bookId);
      await Promise.all(userCacheKeys.map(key => this.cacheManager.del(key)));
      
    } catch (error) {
      this.logger.error(`Error invalidating cache for book ${bookId}: ${error.message}`, error.stack, ReadingIntervalService.name);
    }
  }

  private async getUserCacheKeys(bookId: number): Promise<string[]> {
    // Get users who have read this book
    const users = await this.prisma.readingInterval.findMany({
      where: { bookId },
      select: { userId: true },
      distinct: ['userId'],
    });

    return users.map(user => `user_stats:${user.userId}`);
  }

  private async queueAnalyticsJob(dto: SingleIntervalDto & { userId: number }): Promise<void> {
    try {
      await this.calculateReadingIntervalQueue.add(
        'analytics',
        {
          bookId: dto.bookId,
          userId: dto.userId,
          startPage: dto.startPage,
          endPage: dto.endPage,
          timestamp: new Date().toISOString(),
        },
        {
          delay: 5000, // Process after 5 seconds
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );
    } catch (error) {
      this.logger.error(`Failed to queue analytics job: ${error.message}`, error.stack, ReadingIntervalService.name);
    }
  }
}
