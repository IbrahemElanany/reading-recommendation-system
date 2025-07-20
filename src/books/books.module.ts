import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from './constants';
import { ReadingIntervalService } from './services/reading-interval.service';
import { CalculateReadPagesConsumer } from './queue-consumers/calculate-read-pages.consumer';
import { CalculateReadPagesService } from './services';
import { TopBooksController } from './controllers/top-books.controller';
import { BookReadingIntervalsController } from './controllers/book-reading-intervals.controller';
import { BooksController } from './controllers/books.controller';
import { CreateBookService } from './services/create-book.service';
import { TopBooksService } from './services/top-books.service';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    ConfigModule, // ✅ Add this

    BullModule.registerQueueAsync({
      name: BOOKS_CALCULATE_READING_INTERVAL_QUEUE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
        },
      }),
    }),
  ],
  providers: [
    ReadingIntervalService,
    CalculateReadPagesConsumer,
    CalculateReadPagesService,
    TopBooksService,
    CreateBookService,
  ],
  controllers: [
    BookReadingIntervalsController,
    TopBooksController,
    BooksController,
  ],
  exports: [ReadingIntervalService],
})
export class BooksModule {}