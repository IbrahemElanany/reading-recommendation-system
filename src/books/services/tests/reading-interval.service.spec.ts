import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReadingIntervalService } from '../reading-interval.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from '../../constants';
import { CreateBookIntervalsDto } from '../../dto';
import { Book } from '@prisma/client';

describe('ReadingIntervalService', () => {
  let service: ReadingIntervalService;
  let prismaService: PrismaService;
  let queue: Queue;

  const mockBook: Book = {
    id: 1,
    title: 'Test Book',
    numberOfPages: 300,
    numberOfReadPages: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Book;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingIntervalService,
        {
          provide: PrismaService,
          useValue: {
            readingInterval: {
              createMany: jest.fn(),
            },
            book: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: getQueueToken(BOOKS_CALCULATE_READING_INTERVAL_QUEUE),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReadingIntervalService>(ReadingIntervalService);
    prismaService = module.get<PrismaService>(PrismaService);
    queue = module.get<Queue>(
      getQueueToken(BOOKS_CALCULATE_READING_INTERVAL_QUEUE),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReadingInterval', () => {
    const validDto: CreateBookIntervalsDto = {
      intervals: [
        { startPage: 1, endPage: 10, bookId: 1 },
        { startPage: 15, endPage: 25, bookId: 1 },
      ],
    };

    it('should create reading intervals successfully', async () => {
      const userId = 1;
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prismaService.readingInterval.createMany as jest.Mock).mockResolvedValue(
        { count: 2 },
      );
      (queue.add as jest.Mock).mockResolvedValue({});

      await service.createReadingInterval(userId, validDto);

      expect(prismaService.readingInterval.createMany).toHaveBeenCalledWith({
        data: [
          { startPage: 1, endPage: 10, bookId: 1, userId: 1 },
          { startPage: 15, endPage: 25, bookId: 1, userId: 1 },
        ],
        skipDuplicates: true,
      });

      expect(queue.add).toHaveBeenCalledWith(
        BOOKS_CALCULATE_READING_INTERVAL_QUEUE,
        { bookId: 1 },
      );
    });

    it('should not trigger queue when no intervals are created', async () => {
      const userId = 1;
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prismaService.readingInterval.createMany as jest.Mock).mockResolvedValue(
        { count: 0 },
      );

      await service.createReadingInterval(userId, validDto);

      expect(queue.add).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when intervals are for different books', async () => {
      const userId = 1;
      const invalidDto: CreateBookIntervalsDto = {
        intervals: [
          { startPage: 1, endPage: 10, bookId: 1 },
          { startPage: 15, endPage: 25, bookId: 2 }, // Different book
        ],
      };

      await expect(
        service.createReadingInterval(userId, invalidDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createReadingInterval(userId, invalidDto),
      ).rejects.toThrow('All intervals must be for the same book');
    });

    it('should throw BadRequestException when book does not exist', async () => {
      const userId = 1;
      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createReadingInterval(userId, validDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createReadingInterval(userId, validDto),
      ).rejects.toThrow('Book not found');
    });

    it('should throw BadRequestException when end page exceeds book pages', async () => {
      const userId = 1;
      const invalidDto: CreateBookIntervalsDto = {
        intervals: [
          { startPage: 1, endPage: 350, bookId: 1 }, // Exceeds book's 300 pages
        ],
      };

      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(mockBook);

      await expect(
        service.createReadingInterval(userId, invalidDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createReadingInterval(userId, invalidDto),
      ).rejects.toThrow(
        'Intervals end pages should be smaller than book pages',
      );
    });

    it('should handle single interval correctly', async () => {
      const userId = 1;
      const singleIntervalDto: CreateBookIntervalsDto = {
        intervals: [{ startPage: 50, endPage: 100, bookId: 1 }],
      };

      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prismaService.readingInterval.createMany as jest.Mock).mockResolvedValue(
        { count: 1 },
      );
      (queue.add as jest.Mock).mockResolvedValue({});

      await service.createReadingInterval(userId, singleIntervalDto);

      expect(prismaService.readingInterval.createMany).toHaveBeenCalledWith({
        data: [{ startPage: 50, endPage: 100, bookId: 1, userId: 1 }],
        skipDuplicates: true,
      });
    });

    it('should allow intervals that exactly match book page count', async () => {
      const userId = 1;
      const exactDto: CreateBookIntervalsDto = {
        intervals: [{ startPage: 1, endPage: 300, bookId: 1 }], // Exactly 300 pages
      };

      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prismaService.readingInterval.createMany as jest.Mock).mockResolvedValue(
        { count: 1 },
      );
      (queue.add as jest.Mock).mockResolvedValue({});

      await service.createReadingInterval(userId, exactDto);

      expect(prismaService.readingInterval.createMany).toHaveBeenCalledWith({
        data: [{ startPage: 1, endPage: 300, bookId: 1, userId: 1 }],
        skipDuplicates: true,
      });
    });

    it('should handle empty intervals array', async () => {
      const userId = 1;
      const emptyDto: CreateBookIntervalsDto = {
        intervals: [],
      };

      // This should trigger validation errors before reaching the database
      await expect(
        service.createReadingInterval(userId, emptyDto),
      ).rejects.toThrow();
    });

    it('should handle multiple intervals for same book pages', async () => {
      const userId = 1;
      const multipleDto: CreateBookIntervalsDto = {
        intervals: [
          { startPage: 1, endPage: 50, bookId: 1 },
          { startPage: 51, endPage: 100, bookId: 1 },
          { startPage: 101, endPage: 150, bookId: 1 },
        ],
      };

      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prismaService.readingInterval.createMany as jest.Mock).mockResolvedValue(
        { count: 3 },
      );
      (queue.add as jest.Mock).mockResolvedValue({});

      await service.createReadingInterval(userId, multipleDto);

      expect(prismaService.readingInterval.createMany).toHaveBeenCalledWith({
        data: [
          { startPage: 1, endPage: 50, bookId: 1, userId: 1 },
          { startPage: 51, endPage: 100, bookId: 1, userId: 1 },
          { startPage: 101, endPage: 150, bookId: 1, userId: 1 },
        ],
        skipDuplicates: true,
      });
    });

    it('should handle database errors gracefully', async () => {
      const userId = 1;
      const dbError = new Error('Database connection failed');

      (prismaService.book.findUnique as jest.Mock).mockRejectedValue(dbError);

      await expect(
        service.createReadingInterval(userId, validDto),
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle queue errors gracefully', async () => {
      const userId = 1;
      const queueError = new Error('Queue connection failed');

      (prismaService.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prismaService.readingInterval.createMany as jest.Mock).mockResolvedValue(
        { count: 2 },
      );
      (queue.add as jest.Mock).mockRejectedValue(queueError);

      await expect(
        service.createReadingInterval(userId, validDto),
      ).rejects.toThrow('Queue connection failed');
    });
  });

  describe('business rule validation', () => {
    it('should validate that all intervals are for the same book - valid case', () => {
      const validDto: CreateBookIntervalsDto = {
        intervals: [
          { startPage: 1, endPage: 10, bookId: 5 },
          { startPage: 15, endPage: 25, bookId: 5 },
          { startPage: 30, endPage: 40, bookId: 5 },
        ],
      };

      // This uses private method, so we test it indirectly through createReadingInterval
      expect(() => service['allIntervalsForSameBook'](validDto)).not.toThrow();
      expect(service['allIntervalsForSameBook'](validDto)).toBe(true);
    });

    it('should validate that all intervals are for the same book - invalid case', () => {
      const invalidDto: CreateBookIntervalsDto = {
        intervals: [
          { startPage: 1, endPage: 10, bookId: 5 },
          { startPage: 15, endPage: 25, bookId: 6 }, // Different book
        ],
      };

      expect(service['allIntervalsForSameBook'](invalidDto)).toBe(false);
    });

    it('should validate end pages against book page count', () => {
      const dto: CreateBookIntervalsDto = {
        intervals: [
          { startPage: 1, endPage: 100, bookId: 1 },
          { startPage: 150, endPage: 200, bookId: 1 },
        ],
      };

      expect(
        service['intervalsEndPageShouldBeSmallerThanBookPages'](mockBook, dto),
      ).toBe(true);

      const invalidDto: CreateBookIntervalsDto = {
        intervals: [
          { startPage: 1, endPage: 100, bookId: 1 },
          { startPage: 150, endPage: 350, bookId: 1 }, // Exceeds 300 pages
        ],
      };

      expect(
        service['intervalsEndPageShouldBeSmallerThanBookPages'](
          mockBook,
          invalidDto,
        ),
      ).toBe(false);
    });
  });
});
