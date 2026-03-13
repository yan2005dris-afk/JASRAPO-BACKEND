import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { SessionRedis } from '../common/types/session-redis.interface';

@Injectable()
export class RedisSessionService implements OnModuleInit {
  private readonly logger = new Logger(RedisSessionService.name);

  constructor(@Inject('IORedis') private readonly redis: Redis) {}

  async onModuleInit() {
    try {
      await this.redis.ping();
      this.logger.log('[REDIS:UP] Conexion a Redis establecida correctamente');
    } catch (error) {
      const trace = error instanceof Error ? error.stack : String(error);
      this.logger.error('[REDIS:DOWN] No se pudo conectar a Redis', trace);
      throw error;
    }
  }

  async setSession(session: SessionRedis, ttlSeconds: number) {
    const key = this.getSessionKey(session.usersId, session.sessionsId);
    await this.redis.set(key, JSON.stringify(session), 'EX', ttlSeconds);
  }

  async getSession(
    usersId: number,
    sessionsId: number,
  ): Promise<SessionRedis | null> {
    const key = this.getSessionKey(usersId, sessionsId);
    const data = await this.redis.get(key);
    return data ? (JSON.parse(data) as SessionRedis) : null;
  }

  async delSession(usersId: number, sessionsId: number) {
    const key = this.getSessionKey(usersId, sessionsId);
    await this.redis.del(key);
  }

  async listSessionsByUser(usersId: number): Promise<SessionRedis[]> {
    const keys = await this.redis.keys(`session:${usersId}:*`);
    const sessions = await Promise.all(
      keys.map(async (key) => {
        const data = await this.redis.get(key);
        return data ? (JSON.parse(data) as SessionRedis) : null;
      }),
    );
    return sessions.filter(Boolean) as SessionRedis[];
  }

  private getSessionKey(usersId: number, sessionsId: number) {
    return `session:${usersId}:${sessionsId}`;
  }
}
