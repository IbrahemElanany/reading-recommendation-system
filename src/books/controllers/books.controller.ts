import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateBookService } from '../services/create-book.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookTransformer } from '../transformers/book.transformer';
import { LoggerService } from 'src/logger/logger.service';
import { CreateBookSwagger } from '../decorators/swagger/create-book.swagger';
import { UpdateBookSwagger } from '../decorators/swagger/update-book.swagger';

@ApiTags('Books')
@ApiBearerAuth()
@Controller('books')
export class BooksController {
  constructor(
    private readonly createBookService: CreateBookService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Create a new book (Admin only)
   * @param book CreateBookDto
   * @returns The created book
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @CreateBookSwagger()
  async createBook(
    @Body() book: CreateBookDto,
  ): Promise<any> {
    try {
      const createdBook = await this.createBookService.createBook(book);
      return BookTransformer.fromBook(createdBook); // ✅ simplified
    } catch (error) {
      this.logger.error(BooksController.name, error, error.message);
      throw error;
    }
  }

  /**
   * Update an existing book (Admin only)
   * @param id Book ID
   * @param updateBookDto UpdateBookDto
   * @returns The updated book
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UpdateBookSwagger()
  async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<any> {
    try {
      const updatedBook = await this.createBookService.updateBook(id, updateBookDto);
      return BookTransformer.fromBook(updatedBook); // ✅ simplified
    } catch (error) {
      this.logger.error(BooksController.name, error, error.message);
      throw error;
    }
  }
}