import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  ServiceUnavailableException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * RawPgService - Cliente de PostgreSQL de bajo nivel.
 * Reubicado en infraestructura para queries masivos y SQL crudo seguro.
 */
@Injectable()
export class RawPgService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool | null = null;
  private readonly logger = new Logger(RawPgService.name);

  // Regex para validar identificadores SQL (tablas, columnas)
  private static readonly SAFE_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_.]*$/;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.pool = new Pool({
        host: this.configService.get<string>('POSTGRES_HOST') || 'localhost',
        port: this.configService.get<number>('POSTGRES_PORT') || 5432,
        database: this.configService.get<string>('POSTGRES_DB') || 'appdb',
        user: this.configService.get<string>('POSTGRES_USER') || 'appuser',
        password:
          this.configService.get<string>('POSTGRES_PASSWORD') || 'apppass',
        ssl:
          this.configService.get('POSTGRES_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
        // Pool configurable desde .env
        max: this.configService.get<number>('DB_POOL_MAX', 10),
        idleTimeoutMillis: this.configService.get<number>(
          'DB_POOL_IDLE_TIMEOUT',
          30000,
        ),
        connectionTimeoutMillis: this.configService.get<number>(
          'DB_CONNECTION_TIMEOUT',
          10000,
        ),
        application_name: `jasrapo-raw-pg-${process.env.NODE_ENV ?? 'dev'}`,
      });

      this.pool.on('error', (err) => {
        this.logger.error(
          `Error inesperado en cliente idle del pool: ${err.message}`,
        );
      });

      const client = await this.pool.connect();
      this.logger.log(
        '[RAW-PG:UP] Conexion a PostgreSQL (bajo nivel) establecida correctamente',
      );
      client.release();
    } catch (error) {
      this.logger.error(
        '[RAW-PG:DOWN] No se pudo conectar a PostgreSQL',
        error,
      );
      this.pool = null;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Raw PG connection pool closed');
    }
  }

  private sanitizeIdentifier(identifier: string): string {
    if (!RawPgService.SAFE_IDENTIFIER.test(identifier)) {
      throw new Error(`Identificador SQL no válido: "${identifier}".`);
    }
    return `"${identifier}"`;
  }

  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new ServiceUnavailableException(
        'La base de datos no está disponible.',
      );
    }

    const start = Date.now();
    const operation = text.trim().split(/\s+/)[0].toUpperCase();

    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      this.logger.debug(`[DB] ${operation} → ${duration}ms`);
      return result;
    } catch (error) {
      this.logger.error(
        `[DB] ❌ ${operation} falló: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async queryOne<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<T | null> {
    const result = await this.query<T>(text, params);
    return result.rows[0] || null;
  }

  async queryAll<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<T[]> {
    const result = await this.query<T>(text, params);
    return result.rows;
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool)
      throw new ServiceUnavailableException('Base de datos no disponible');
    return await this.pool.connect();
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async insert<T extends QueryResultRow = any>(
    table: string,
    data: Record<string, any>,
    returning: string = '*',
  ): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const safeTable = this.sanitizeIdentifier(table);
    const safeColumns = keys.map((k) => this.sanitizeIdentifier(k)).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const query = `INSERT INTO ${safeTable} (${safeColumns}) VALUES (${placeholders}) RETURNING ${returning}`;
    return this.queryOne<T>(query, values);
  }

  async update<T extends QueryResultRow = any>(
    table: string,
    data: Record<string, any>,
    where: string,
    whereParams: any[],
    returning: string = '*',
    options?: { strict?: boolean },
  ): Promise<T[]> {
    if (!data || Object.keys(data).length === 0) {
      throw new Error(
        `No se proporcionaron datos para actualizar en tabla "${table}"`,
      );
    }

    const keys = Object.keys(data);
    const values = Object.values(data);
    const safeTable = this.sanitizeIdentifier(table);
    const setClause = keys
      .map((key, i) => `${this.sanitizeIdentifier(key)} = $${i + 1}`)
      .join(', ');
    const paramOffset = keys.length;

    // Adjust where params placeholders
    const adjustedWhere = where.replace(
      /\$(\d+)/g,
      (_, num) => `$${parseInt(num) + paramOffset}`,
    );

    const query = `UPDATE ${safeTable} SET ${setClause} WHERE ${adjustedWhere} RETURNING ${returning}`;
    const result = await this.query<T>(query, [...values, ...whereParams]);

    // Si strict=true y no se actualizó nada → lanzar error
    if (options?.strict && (result.rowCount ?? 0) === 0) {
      throw new NotFoundException(
        `No se encontró el registro a actualizar en "${table}" con los criterios proporcionados.`,
      );
    }

    return result.rows;
  }
}
