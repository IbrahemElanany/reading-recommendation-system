import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { ThrottleGuard } from './common/guards/throttle.guard';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    /**
     * 🌍 Load environment variables globally
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    /**
     * ⚡ Register global cache with Redis
     */
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: config.get<number>('REDIS_PORT', 6379),
        ttl: config.get<number>('CACHE_TTL', 60), // seconds
        max: config.get<number>('CACHE_MAX', 100), // maximum number of items in cache
      }),
    }),

    /**
     * 🔌 App Modules
     */
    PrismaModule,
    AuthModule,
    LoggerModule,
    BooksModule
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    PrismaService,
    ThrottleGuard
  ],
  exports: [PrismaService],
})
export class AppModule {}
