import { Test, TestingModule } from '@nestjs/testing';
import { TopBooksService } from '../top-books.service';
import { Book } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LoggerService } from 'src/logger/logger.service';
import { ConfigService } from '@nestjs/config';

describe('TopBooksService', () => {
  let service: TopBooksService;
  let prismaService: PrismaService;
  let cacheManager: any;
  let loggerService: LoggerService;
  let configService: ConfigService;

  const mockBooks = [
    {
      id: 1,
      title: 'The Great Gatsby',
      numberOfPages: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: '1984',
      numberOfPages: 300,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: 'To Kill a Mockingbird',
      numberOfPages: 250,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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
            $queryRawUnsafe: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            store: {
              client: {
                scan: jest.fn(),
              },
            },
          },
        },
        {
          provide: LoggerService,
          useValue: {
            debug: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                'TOP_BOOKS_CACHE_TTL': 300,
                'ENABLE_CACHE': true,
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TopBooksService>(TopBooksService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);
    loggerService = module.get<LoggerService>(LoggerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTopBooks', () => {
    it('should return cached result when available', async () => {
      const cachedBooks = [
        {
          book_id: '1',
          book_name: 'The Great Gatsby',
          num_of_pages: '200',
          num_of_read_pages: '180',
        },
      ];

      (cacheManager.get as jest.Mock).mockResolvedValue(cachedBooks);

      const result = await service.getTopBooks(5);

      expect(cacheManager.get).toHaveBeenCalledWith('top_books:5');
      expect(result).toEqual(cachedBooks);
      expect(prismaService.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it('should query database and cache result when cache miss', async () => {
      const dbResult = [
        {
          book_id: 1,
          book_name: 'The Great Gatsby',
          num_of_pages: 200,
          num_of_read_pages: 180,
        },
      ];

      (cacheManager.get as jest.Mock).mockResolvedValue(null);
      (prismaService.$queryRawUnsafe as jest.Mock).mockResolvedValue(dbResult);
      (cacheManager.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.getTopBooks(5);

      expect(cacheManager.get).toHaveBeenCalledWith('top_books:5');
      expect(prismaService.$queryRawUnsafe).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('top_books:5', result, 300000);
      expect(result).toEqual([
        {
          book_id: '1',
          book_name: 'The Great Gatsby',
          num_of_pages: '200',
          num_of_read_pages: '180',
        },
      ]);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      (cacheManager.get as jest.Mock).mockRejectedValue(error);

      await expect(service.getTopBooks(5)).rejects.toThrow('Database error');
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache using Redis scan', async () => {
      const mockKeys = ['top_books:5', 'top_books:10'];
      (cacheManager.store.client.scan as jest.Mock).mockResolvedValue([0, mockKeys]);
      (cacheManager.del as jest.Mock).mockResolvedValue(undefined);

      await service.invalidateCache();

      expect(cacheManager.store.client.scan).toHaveBeenCalledWith(
        0,
        'MATCH',
        'top_books:*',
        'COUNT',
        '100'
      );
      expect(cacheManager.del).toHaveBeenCalledTimes(2);
    });

    it('should use fallback when Redis scan is not available', async () => {
      (cacheManager.store.client.scan as jest.Mock).mockRejectedValue(new Error('Not available'));
      (cacheManager.del as jest.Mock).mockResolvedValue(undefined);

      await service.invalidateCache();

      expect(cacheManager.del).toHaveBeenCalledWith('top_books:5');
      expect(cacheManager.del).toHaveBeenCalledWith('top_books:10');
      expect(cacheManager.del).toHaveBeenCalledWith('top_books:20');
    });
  });

  describe('getCacheStats', () => {
    it('should return cache configuration', async () => {
      const stats = await service.getCacheStats();

      expect(stats).toEqual({
        enabled: true,
        ttl: 300,
        cacheKey: 'top_books',
      });
    });
  });
});
