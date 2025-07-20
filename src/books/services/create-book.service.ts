import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { Book } from '@prisma/client';

@Injectable()
export class CreateBookService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new book in the system.
   * @param book - Book creation DTO
   * @returns The created Book entity
   */
  async createBook(book: CreateBookDto): Promise<Book> {
    try {
      return await this.prisma.book.create({ data: book });
    } catch (error) {
      throw new BadRequestException('Error creating book');
    }
  }

  /**
   * Updates an existing book. Only provided fields are updated.
   * @param id - Book ID
   * @param updateBookDto - Partial update DTO
   * @returns The updated Book entity
   * @throws NotFoundException if the book does not exist
   */
  async updateBook(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    // Check if the book exists
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Book not found');
    }
    try {
      return await this.prisma.book.update({ where: { id }, data: updateBookDto });
    } catch (error) {
      throw new BadRequestException('Error updating book');
    }
  }
}