import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateBookService } from '../create-book.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from '../../dto';
import { Book } from '@prisma/client';

describe('CreateBookService', () => {
  let service: CreateBookService;
  let prismaService: PrismaService;

  const mockCreateBookDto: CreateBookDto = {
    title: 'Test Book',
    numberOfPages: 300,
  };

  const mockCreatedBook: Book = {
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
        CreateBookService,
        {
          provide: PrismaService,
          useValue: {
            book: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CreateBookService>(CreateBookService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBook', () => {
    it('should successfully create a book', async () => {
      jest
        .spyOn(prismaService.book, 'create')
        .mockResolvedValue(mockCreatedBook);

      const result = await service.createBook(mockCreateBookDto);

      expect(prismaService.book.create).toHaveBeenCalledWith({
        data: mockCreateBookDto,
      });
      expect(result).toEqual(mockCreatedBook);
    });

    it('should throw BadRequestException when prisma throws an error', async () => {
      const prismaError = new Error('Database constraint violation');
      jest.spyOn(prismaService.book, 'create').mockRejectedValue(prismaError);

      await expect(service.createBook(mockCreateBookDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createBook(mockCreateBookDto)).rejects.toThrow(
        'Error creating book',
      );
    });

    it('should handle prisma unique constraint errors', async () => {
      const uniqueConstraintError = new Error('Unique constraint failed');
      jest
        .spyOn(prismaService.book, 'create')
        .mockRejectedValue(uniqueConstraintError);

      await expect(service.createBook(mockCreateBookDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle prisma foreign key constraint errors', async () => {
      const foreignKeyError = new Error('Foreign key constraint failed');
      jest
        .spyOn(prismaService.book, 'create')
        .mockRejectedValue(foreignKeyError);

      await expect(service.createBook(mockCreateBookDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle null or undefined input gracefully', async () => {
      const nullError = new Error('Null value not allowed');
      jest.spyOn(prismaService.book, 'create').mockRejectedValue(nullError);

      await expect(service.createBook(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create book with minimal valid data', async () => {
      const minimalBook: CreateBookDto = {
        title: 'Minimal Book',
        numberOfPages: 1,
      };

      const minimalCreatedBook = {
        ...mockCreatedBook,
        title: 'Minimal Book',
        numberOfPages: 1,
      };

      jest
        .spyOn(prismaService.book, 'create')
        .mockResolvedValue(minimalCreatedBook);

      const result = await service.createBook(minimalBook);

      expect(prismaService.book.create).toHaveBeenCalledWith({
        data: minimalBook,
      });
      expect(result).toEqual(minimalCreatedBook);
    });

    it('should create book with large page count', async () => {
      const largeBook: CreateBookDto = {
        title: 'Very Large Book',
        numberOfPages: 10000,
      };

      const largeCreatedBook = {
        ...mockCreatedBook,
        title: 'Very Large Book',
        numberOfPages: 10000,
      };

      jest
        .spyOn(prismaService.book, 'create')
        .mockResolvedValue(largeCreatedBook);

      const result = await service.createBook(largeBook);

      expect(result.numberOfPages).toBe(10000);
    });
  });
});
