import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BOOKS_CALCULATE_READING_INTERVAL_QUEUE } from '../constants';
import { Job } from 'bullmq';
import { CalculateReadPagesService } from '../services';
import { LoggerService } from 'src/logger/logger.service';

@Processor(BOOKS_CALCULATE_READING_INTERVAL_QUEUE)
export class CalculateReadPagesConsumer extends WorkerHost {
  constructor(
    private readonly calculateReadPagesService: CalculateReadPagesService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<{ bookId: number }>) {
    try {
      // Calculate the total unique pages read for the book (on demand)
      const totalPagesRead = await this.calculateReadPagesService.getTotalUniquePagesRead(job.data.bookId);
      this.logger.log(
        `Calculated total unique pages read for bookId ${job.data.bookId}: ${totalPagesRead}`,
        CalculateReadPagesConsumer.name
      );
      // If you need to do something with this value (e.g., cache, notify), do it here
    } catch (error) {
      this.logger.error(CalculateReadPagesConsumer.name, error, error.message);
      throw error;
    }
  }
}