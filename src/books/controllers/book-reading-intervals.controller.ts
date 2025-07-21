import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReadingIntervalService } from '../services/reading-interval.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LoggerService } from 'src/logger/logger.service';
import { SingleIntervalDto } from '../dto/single-interval.dto';
import { CreateReadingIntervalsSwagger } from '../decorators/swagger/reading-intervals.swagger';

@ApiTags('Books')
@Controller('books')
export class BookReadingIntervalsController {
  constructor(
    private readonly readingIntervalService: ReadingIntervalService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Submit a single reading interval for a book (one by one)
   * @param dto SingleIntervalDto
   * @param userId Current user ID (from JWT)
   * @returns Success status
   */
  @Post('reading-interval')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.CREATED)
  @CreateReadingIntervalsSwagger()
  async submitSingleReadingInterval(
    @Body() dto: SingleIntervalDto,
    @CurrentUser('id') userId: number,
  ): Promise<{ status_code: string }> {
    if (!userId) {
      throw new BadRequestException('User ID is missing from request');
    }
    try {
      await this.readingIntervalService.submitSingleInterval({ ...dto, userId });
    } catch (error) {
      this.logger.error(
        BookReadingIntervalsController.name,
        error,
        error.message,
      );
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Error creating reading interval');
    }
    return { status_code: 'success' };
  }
}
