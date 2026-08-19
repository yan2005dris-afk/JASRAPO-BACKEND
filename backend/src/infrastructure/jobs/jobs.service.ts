import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PgBoss,
  JobInsert,
  SendOptions,
  WorkHandler,
  WorkWithMetadataHandler,
} from 'pg-boss';

/**
 * Servicio base de PgBoss para gestionar colas en PostgreSQL.
 * Actúa como motor central de trabajos para toda la aplicación.
 */
@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private boss: PgBoss;
  private readonly queuePromises = new Map<string, Promise<void>>();

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.get<string>('DATABASE_URL')!;

    this.boss = new PgBoss({
      connectionString,
      schema: 'jobs',
      application_name: 'jasrapo-backend-jobs',
    });

    this.boss.on('error', (error) => this.logger.error('PgBoss Error:', error));
  }

  async onModuleInit() {
    try {
      await this.boss.start();
      this.logger.log('PgBoss (Jobs Engine) started on schema "jobs"');
    } catch (error) {
      this.logger.error('Error al iniciar PgBoss:', error);
    }
  }

  async onModuleDestroy() {
    await this.boss.stop();
  }

  // pg-boss v12 requires explicit queue creation before send/work.
  // Cache ensures createQueue is called once per queue per process lifetime.
  private async ensureQueue(name: string): Promise<void> {
    let promise = this.queuePromises.get(name);
    if (!promise) {
      promise = (async () => {
        try {
          await this.boss.createQueue(name);
        } catch (error) {
          this.logger.error(`Error al crear la cola "${name}":`, error);
          this.queuePromises.delete(name); // Permite reintentar si falla
          throw error;
        }
      })();
      this.queuePromises.set(name, promise);
    }
    return promise;
  }

  async send(name: string, data: object, options?: SendOptions) {
    await this.ensureQueue(name);
    return this.boss.send(name, data, options);
  }

  async insert(name: string, jobs: JobInsert[]) {
    await this.ensureQueue(name);
    return this.boss.insert(name, jobs);
  }

  async schedule(name: string, cron: string, data?: object, options?: SendOptions) {
    await this.ensureQueue(name);
    return this.boss.schedule(name, cron, data || {}, options);
  }

  async unschedule(name: string) {
    return this.boss.unschedule(name);
  }

  async work(name: string, handler: WorkHandler<any>) {
    await this.ensureQueue(name);
    return this.boss.work(name, handler);
  }

  async workWithMetadata<T>(
    name: string,
    handler: WorkWithMetadataHandler<T>,
  ): Promise<string> {
    await this.ensureQueue(name);
    return this.boss.work(name, { includeMetadata: true }, handler);
  }

  getBossInstance(): PgBoss {
    return this.boss;
  }
}
