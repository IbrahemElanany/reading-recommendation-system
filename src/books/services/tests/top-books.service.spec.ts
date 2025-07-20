import { Test, TestingModule } from '@nestjs/testing';
import { TopBooksService } from '../top-books.service';
import { Book } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TopBooksService', () => {
  let service: TopBooksService;
  let prismaService: PrismaService;

  const mockBooks: Book[] = [
    {
      id: 1,
      title: 'The Great Gatsby',
      numberOfPages: 200,
      numberOfReadPages: 180,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: '1984',
      numberOfPages: 300,
      numberOfReadPages: 150,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: 'To Kill a Mockingbird',
      numberOfPages: 250,
      numberOfReadPages: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] as Book[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopBooksService,
        {
          provide: PrismaService,
          useValue: {
            book: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TopBooksService>(TopBooksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTopBooks', () => {
    it('should return top books ordered by numberOfReadPages descending with default limit', async () => {
      const expectedBooks = mockBooks.slice(0, 5);
      jest
        .spyOn(prismaService.book, 'findMany')
        .mockResolvedValue(expectedBooks);

      const result = await service.getTopBooks();

      expect(prismaService.book.findMany).toHaveBeenCalledWith({
        orderBy: {
          numberOfReadPages: 'desc',
        },
        take: 5,
      });
      expect(result).toEqual(expectedBooks);
    });

    it('should return top books with custom limit', async () => {
      const limit = 2;
      const expectedBooks = mockBooks.slice(0, limit);
      jest
        .spyOn(prismaService.book, 'findMany')
        .mockResolvedValue(expectedBooks);

      const result = await service.getTopBooks(limit);

      expect(prismaService.book.findMany).toHaveBeenCalledWith({
        orderBy: {
          numberOfReadPages: 'desc',
        },
        take: limit,
      });
      expect(result).toEqual(expectedBooks);
    });

    it('should return empty array when no books exist', async () => {
      jest.spyOn(prismaService.book, 'findMany').mockResolvedValue([]);

      const result = await service.getTopBooks();

      expect(result).toEqual([]);
    });

    it('should handle limit of 0', async () => {
      jest.spyOn(prismaService.book, 'findMany').mockResolvedValue([]);

      const result = await service.getTopBooks(0);

      expect(prismaService.book.findMany).toHaveBeenCalledWith({
        orderBy: {
          numberOfReadPages: 'desc',
        },
        take: 0,
      });
      expect(result).toEqual([]);
    });

    it('should handle large limit numbers', async () => {
      const limit = 1000;
      jest.spyOn(prismaService.book, 'findMany').mockResolvedValue(mockBooks);

      const result = await service.getTopBooks(limit);

      expect(prismaService.book.findMany).toHaveBeenCalledWith({
        orderBy: {
          numberOfReadPages: 'desc',
        },
        take: limit,
      });
      expect(result).toEqual(mockBooks);
    });

    it('should propagate database errors', async () => {
      const error = new Error('Database connection failed');
      jest.spyOn(prismaService.book, 'findMany').mockRejectedValue(error);

      await expect(service.getTopBooks()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
