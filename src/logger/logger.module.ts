import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as winston from 'winston';
import { LoggerService } from './logger.service';

@Module({
  imports: [
    ConfigModule,
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transports: [
          // Console transport (with colorized, pretty logs for dev)
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              winston.format.colorize(),
              winston.format.printf(({ level, message, timestamp, context }) => {
                return `[${timestamp}] ${level} [${context || 'App'}] ${message}`;
              }),
            ),
          }),

          // Error logs to file
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),

          // Combined logs to file
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ],
        // Handle uncaught exceptions and unhandled rejections
        exceptionHandlers: [
          new winston.transports.File({ filename: 'logs/exceptions.log' }),
        ],
        rejectionHandlers: [
          new winston.transports.File({ filename: 'logs/rejections.log' }),
        ],
      }),
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}