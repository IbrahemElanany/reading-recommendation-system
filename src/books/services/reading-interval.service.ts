import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from '../constants';
import { Queue } from 'bullmq';
import { Book } from '@prisma/client';
import { SingleIntervalDto } from '../dto/single-interval.dto';

@Injectable()
export class ReadingIntervalService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(BOOKS_CALCULATE_READING_INTERVAL_QUEUE)
    private readonly calculateReadingIntervalQueue: Queue,
  ) {}

  /**
   * Submit a single reading interval for a book (one by one)
   * Handles duplicate intervals gracefully (idempotent).
   * @param dto - SingleIntervalDto with userId
   */
  async submitSingleInterval(dto: SingleIntervalDto & { userId: number }): Promise<void> {
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
      return;
    }
    // Insert the interval
    await this.prisma.readingInterval.create({
      data: {
        startPage: dto.startPage,
        endPage: dto.endPage,
        bookId: dto.bookId,
        userId: dto.userId,
      },
    });
    // Optionally, trigger recalculation or queue job here
  }
}
