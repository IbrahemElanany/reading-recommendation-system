import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CalculateReadPagesService {
  private readonly BATCH_SIZE = 1000; // Process 1000 intervals at a time

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the total number of unique pages read for a given book, calculated on demand.
   */
  async getTotalUniquePagesRead(bookId: number): Promise<number> {
    // Fetch all intervals for the book
    const intervals = await this.getReadingIntervals(bookId);
    if (!intervals.length) {
      return 0;
    }
    // Merge overlapping intervals
    const mergedIntervals = this.mergeOverlappingIntervals(intervals);
    // Calculate total unique pages
    return this.calculateTotalUniquePages(mergedIntervals);
  }

  private async getReadingIntervals(
    bookId: number,
  ): Promise<{ startPage: number; endPage: number }[]> {
    const intervals = await this.prisma.readingInterval.findMany({
      where: { bookId },
      select: {
        startPage: true,
        endPage: true,
      },
      orderBy: { startPage: 'asc' },
    });
    return intervals;
  }

  private mergeOverlappingIntervals(
    intervals: { startPage: number; endPage: number }[],
  ): { startPage: number; endPage: number }[] {
    if (!intervals.length) return [];
    const mergedIntervals: { startPage: number; endPage: number }[] = [];
    let currentInterval = { ...intervals[0] };
    for (let i = 1; i < intervals.length; i++) {
      const interval = intervals[i];
      if (interval.startPage <= currentInterval.endPage + 1) {
        // Merge overlapping or adjacent intervals
        currentInterval.endPage = Math.max(
          currentInterval.endPage,
          interval.endPage,
        );
      } else {
        mergedIntervals.push(currentInterval);
        currentInterval = { ...interval };
      }
    }
    mergedIntervals.push(currentInterval);
    return mergedIntervals;
  }

  private calculateTotalUniquePages(
    intervals: { startPage: number; endPage: number }[],
  ): number {
    return intervals.reduce((sum, interval) => {
      return sum + (interval.endPage - interval.startPage + 1);
    }, 0);
  }
}
