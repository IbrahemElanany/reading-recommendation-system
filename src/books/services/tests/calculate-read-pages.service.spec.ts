import { Test, TestingModule } from '@nestjs/testing';
import { CalculateReadPagesService } from '../calculate-read-pages.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CalculateReadPagesService', () => {
  let service: CalculateReadPagesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateReadPagesService,
        {
          provide: PrismaService,
          useValue: {
            readingInterval: {
              findMany: jest.fn(),
            },
            book: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CalculateReadPagesService>(CalculateReadPagesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    it('should handle empty intervals and return early', async () => {
      const bookId = 1;
      (prismaService.readingInterval.findMany as jest.Mock).mockResolvedValue(
        [],
      );

      await service.calculate(bookId);

      expect(prismaService.readingInterval.findMany).toHaveBeenCalledWith({
        where: { bookId },
        select: {
          startPage: true,
          endPage: true,
        },
        orderBy: { startPage: 'asc' },
      });
      expect(prismaService.book.update).not.toHaveBeenCalled();
    });

    it('should calculate pages for single interval', async () => {
      const bookId = 1;
      const intervals = [{ startPage: 1, endPage: 10 }];

      (prismaService.readingInterval.findMany as jest.Mock).mockResolvedValue(
        intervals,
      );
      (prismaService.book.update as jest.Mock).mockResolvedValue({});

      await service.calculate(bookId);

      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: { numberOfReadPages: 10 }, // 10 - 1 + 1 = 10 pages
      });
    });

    it('should calculate pages for non-overlapping intervals', async () => {
      const bookId = 1;
      const intervals = [
        { startPage: 1, endPage: 5 },
        { startPage: 10, endPage: 15 },
        { startPage: 20, endPage: 25 },
      ];

      (prismaService.readingInterval.findMany as jest.Mock).mockResolvedValue(
        intervals,
      );
      (prismaService.book.update as jest.Mock).mockResolvedValue({});

      await service.calculate(bookId);

      // (5-1+1) + (15-10+1) + (25-20+1) = 5 + 6 + 6 = 17 pages
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: { numberOfReadPages: 17 },
      });
    });

    it('should merge overlapping intervals correctly', async () => {
      const bookId = 1;
      const intervals = [
        { startPage: 1, endPage: 10 },
        { startPage: 5, endPage: 15 },
        { startPage: 12, endPage: 20 },
      ];

      (prismaService.readingInterval.findMany as jest.Mock).mockResolvedValue(
        intervals,
      );
      (prismaService.book.update as jest.Mock).mockResolvedValue({});

      await service.calculate(bookId);

      // Merged interval: 1-20 = 20 pages
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: { numberOfReadPages: 20 },
      });
    });

    it('should merge adjacent intervals correctly', async () => {
      const bookId = 1;
      const intervals = [
        { startPage: 1, endPage: 5 },
        { startPage: 6, endPage: 10 },
        { startPage: 11, endPage: 15 },
      ];

      (prismaService.readingInterval.findMany as jest.Mock).mockResolvedValue(
        intervals,
      );
      (prismaService.book.update as jest.Mock).mockResolvedValue({});

      await service.calculate(bookId);

      // Merged interval: 1-15 = 15 pages
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: { numberOfReadPages: 15 },
      });
    });

    it('should handle complex overlapping and adjacent intervals', async () => {
      const bookId = 1;
      const intervals = [
        { startPage: 1, endPage: 5 },
        { startPage: 6, endPage: 10 }, // Adjacent to first
        { startPage: 8, endPage: 15 }, // Overlaps with second
        { startPage: 20, endPage: 25 }, // Separate interval
        { startPage: 23, endPage: 30 }, // Overlaps with fourth
      ];

      (prismaService.readingInterval.findMany as jest.Mock).mockResolvedValue(
        intervals,
      );
      (prismaService.book.update as jest.Mock).mockResolvedValue({});

      await service.calculate(bookId);

      // Merged intervals: [1-15] and [20-30] = 15 + 11 = 26 pages
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: { numberOfReadPages: 26 },
      });
    });

    it('should handle error during calculation and re-throw it', async () => {
      const bookId = 1;
      const error = new Error('Database error');

      (prismaService.readingInterval.findMany as jest.Mock).mockRejectedValue(
        error,
      );

      await expect(service.calculate(bookId)).rejects.toThrow('Database error');
    });
  });

  describe('private methods behavior validation', () => {
    it('should properly sort intervals by startPage', async () => {
      const bookId = 1;
      const unsortedIntervals = [
        { startPage: 10, endPage: 15 },
        { startPage: 1, endPage: 5 },
        { startPage: 5, endPage: 8 },
      ];

      (prismaService.readingInterval.findMany as jest.Mock).mockResolvedValue(
        unsortedIntervals,
      );
      (prismaService.book.update as jest.Mock).mockResolvedValue({});

      await service.calculate(bookId);

      expect(prismaService.readingInterval.findMany).toHaveBeenCalledWith({
        where: { bookId },
        select: {
          startPage: true,
          endPage: true,
        },
        orderBy: { startPage: 'asc' },
      });
    });
  });
});
