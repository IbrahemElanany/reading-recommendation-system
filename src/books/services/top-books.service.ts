import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookTransformer } from '../transformers/book.transformer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LoggerService } from 'src/logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TopBooksService {
  private readonly CACHE_KEY = 'top_books';
  private readonly CACHE_TTL: number;
  private readonly ENABLE_CACHE: boolean;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.CACHE_TTL = this.configService.get<number>('TOP_BOOKS_CACHE_TTL', 300); // 5 minutes
    this.ENABLE_CACHE = this.configService.get<boolean>('ENABLE_CACHE', true);
  }

  async getTopBooks(limit = 5): Promise<BookTransformer[]> {
    const cacheKey = `${this.CACHE_KEY}:${limit}`;
    
    try {
      // Try to get from cache first
      if (this.ENABLE_CACHE) {
        const cachedResult = await this.cacheManager.get<BookTransformer[]>(cacheKey);
        if (cachedResult) {
          this.logger.debug(`Cache hit for top books (limit: ${limit})`, TopBooksService.name);
          return cachedResult;
        }
      }

      // Cache miss - calculate from database
      this.logger.debug(`Cache miss for top books (limit: ${limit})`, TopBooksService.name);
      const results = await this.calculateTopBooksFromDatabase(limit);
      
      // Cache the result
      if (this.ENABLE_CACHE) {
        await this.cacheManager.set(cacheKey, results, this.CACHE_TTL * 1000);
        this.logger.debug(`Cached top books result (limit: ${limit})`, TopBooksService.name);
      }

      return results;
    } catch (error) {
      this.logger.error(`Error getting top books: ${error.message}`, error.stack, TopBooksService.name);
      throw error;
    }
  }

  private async calculateTopBooksFromDatabase(limit: number): Promise<BookTransformer[]> {
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
      GROUP BY b.id, b.title, b."number_of_pages"
      ORDER BY num_of_read_pages DESC, b.title ASC
      LIMIT $1
    `, limit);

    return results.map(row => ({
      book_id: String(row.book_id),
      book_name: row.book_name,
      num_of_pages: String(row.num_of_pages),
      num_of_read_pages: String(row.num_of_read_pages),
    }));
  }

  /**
   * Invalidate cache when reading intervals are added/updated
   */
  async invalidateCache(): Promise<void> {
    try {
      // For Redis, we can use pattern-based deletion
      const redisClient = (this.cacheManager as any).store?.client;
      if (redisClient && redisClient.scan) {
        const keys = await redisClient.scan(0, 'MATCH', `${this.CACHE_KEY}:*`, 'COUNT', '100');
        if (keys[1] && keys[1].length > 0) {
          await Promise.all(keys[1].map(key => this.cacheManager.del(key)));
          this.logger.debug(`Invalidated ${keys[1].length} top books cache entries`, TopBooksService.name);
        }
      } else {
        // Fallback: delete specific known keys
        await this.cacheManager.del(`${this.CACHE_KEY}:5`);
        await this.cacheManager.del(`${this.CACHE_KEY}:10`);
        await this.cacheManager.del(`${this.CACHE_KEY}:20`);
        this.logger.debug('Invalidated top books cache entries (fallback)', TopBooksService.name);
      }
    } catch (error) {
      this.logger.error(`Error invalidating cache: ${error.message}`, error.stack, TopBooksService.name);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStats(): Promise<{
    enabled: boolean;
    ttl: number;
    cacheKey: string;
  }> {
    return {
      enabled: this.ENABLE_CACHE,
      ttl: this.CACHE_TTL,
      cacheKey: this.CACHE_KEY,
    };
  }
}
