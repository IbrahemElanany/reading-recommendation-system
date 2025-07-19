import {
    CanActivate,
    ExecutionContext,
    Injectable,
    HttpException,
    HttpStatus,
    Inject,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
  
export class ThrottleGuard implements CanActivate {
    private readonly logger = new Logger(ThrottleGuard.name);

    constructor(
        private readonly reflector: Reflector,
        @Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
        private readonly configService: ConfigService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
    
        const ip = request.ip;
        const route = request.route.path;
        const method = request.method;
    
        // Read route-specific limit or fallback to global config
        const metadata = this.reflector.get<{ limit: number; duration: number }>(
          'rate_limit',
          context.getHandler(),
        );
        const limit = metadata?.limit ?? this.configService.get<number>('RATE_LIMIT', 100);
        const duration = metadata?.duration ?? this.configService.get<number>('RATE_DURATION', 60);
    
        const key = `throttle:${ip}:${method}:${route}`;
        const current = (await this.cacheManager.get<number>(key)) || 0;
    
        if (current >= limit) {
          this.logger.warn(`Rate limit hit by ${ip} on ${method} ${route}`);
          throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        }
    
        await this.cacheManager.set(key, current + 1, duration * 1000);
        return true;
    }
  }
  