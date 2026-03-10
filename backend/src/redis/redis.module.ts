import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisSessionService } from './redis-session.service';

@Global()
@Module({
  providers: [
    {
      provide: 'IORedis',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
        });
      },
    },
    RedisSessionService,
  ],
  exports: ['IORedis', RedisSessionService],
})
export class RedisModule {}
