import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TopBooksService } from '../services/top-books.service';
import { LoggerService } from 'src/logger/logger.service';
import { Book, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { TopBooksResponseDto } from '../dto/responses/top-books-response.dto';
import { plainToInstance } from 'class-transformer';
import { BookTransformer } from '../transformers/book.transformer';
import { TopBooksSwagger } from '../decorators/swagger/top-books.swagger';

@Controller('books')
export class TopBooksController {
  constructor(
    private readonly topBooksService: TopBooksService,
    private readonly logger: LoggerService,
  ) {}

  @Get('top')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @TopBooksSwagger()
  async getTopBooks(): Promise<TopBooksResponseDto> {
    try {
      const topBooks = await this.topBooksService.getTopBooks();
      return {
        books: topBooks.map((book) => BookTransformer.fromBook(book)),
      };
    } catch (error) {
      this.logger.error(TopBooksController.name, error, error.message);
      throw new BadRequestException('Error getting top books');
    }
  }
}
