import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
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
  async getTopBooks(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ): Promise<TopBooksResponseDto> {
    try {
      // Validate limit parameter
      if (limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      const topBooks = await this.topBooksService.getTopBooks(limit);
      return {
        books: topBooks.map((book) => BookTransformer.fromBook(book)),
      };
    } catch (error) {
      this.logger.error(TopBooksController.name, error, error.message);
      throw new BadRequestException('Error getting top books');
    }
  }

  @Get('cache/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getCacheStats(): Promise<any> {
    try {
      const stats = await this.topBooksService.getCacheStats();
      return {
        message: 'Cache statistics retrieved successfully',
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(TopBooksController.name, error, error.message);
      throw new BadRequestException('Error getting cache statistics');
    }
  }

  @Get('cache/clear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async clearCache(): Promise<{ message: string; timestamp: string }> {
    try {
      await this.topBooksService.invalidateCache();
      return {
        message: 'Top books cache cleared successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(TopBooksController.name, error, error.message);
      throw new BadRequestException('Error clearing cache');
    }
  }
}
