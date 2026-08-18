import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

/**
 * Thrown when the underlying Prisma client raises a known request error
 * while reading from `sistema_config`. Carries the original error as `cause`
 * so callers can inspect Prisma error codes (e.g. P1001, P1008) if needed.
 */
export class SistemaConfigRepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SistemaConfigRepositoryError';
  }
}

export interface SistemaConfigRecord {
  id: number;
  clave: string;
  valor: string;
  descripcion: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository access to the `sistema_config` key/value table.
 */
@Injectable()
export class SistemaConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all config entries ordered by id
   */
  async findAll(): Promise<SistemaConfigRecord[]> {
    try {
      return await this.prisma.sistemaConfig.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new SistemaConfigRepositoryError(
          'Failed to read all sistema_config entries',
          err,
        );
      }
      throw err;
    }
  }

  /**
   * Returns the `valor` column for the given `clave`, or `null` if no row
   * exists with that key.
   */
  async findByClave(clave: string): Promise<string | null> {
    try {
      const row = await this.prisma.sistemaConfig.findUnique({
        where: { clave },
        select: { valor: true },
      });
      return row?.valor ?? null;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new SistemaConfigRepositoryError(
          `Failed to read sistema_config[clave=${clave}]`,
          err,
        );
      }
      throw err;
    }
  }

  /**
   * Returns the full record for the given `clave`, or `null` if not found.
   */
  async findRecordByClave(clave: string): Promise<SistemaConfigRecord | null> {
    try {
      return await this.prisma.sistemaConfig.findUnique({
        where: { clave },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new SistemaConfigRepositoryError(
          `Failed to read sistema_config[clave=${clave}]`,
          err,
        );
      }
      throw err;
    }
  }

  /**
   * Creates a new config entry or throws if key exists
   */
  async create(data: {
    clave: string;
    valor: string;
    descripcion?: string | null;
  }): Promise<SistemaConfigRecord> {
    try {
      return await this.prisma.sistemaConfig.create({
        data: {
          clave: data.clave,
          valor: data.valor,
          descripcion: data.descripcion ?? null,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new SistemaConfigRepositoryError(
          `Failed to create sistema_config[clave=${data.clave}]`,
          err,
        );
      }
      throw err;
    }
  }

  /**
   * Updates an existing config entry by clave
   */
  async update(
    clave: string,
    data: { valor?: string; descripcion?: string | null },
  ): Promise<SistemaConfigRecord> {
    try {
      return await this.prisma.sistemaConfig.update({
        where: { clave },
        data: {
          ...(data.valor !== undefined && { valor: data.valor }),
          ...(data.descripcion !== undefined && {
            descripcion: data.descripcion,
          }),
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new SistemaConfigRepositoryError(
          `Failed to update sistema_config[clave=${clave}]`,
          err,
        );
      }
      throw err;
    }
  }

  /**
   * Deletes a config entry by clave
   */
  async delete(clave: string): Promise<SistemaConfigRecord> {
    try {
      return await this.prisma.sistemaConfig.delete({
        where: { clave },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new SistemaConfigRepositoryError(
          `Failed to delete sistema_config[clave=${clave}]`,
          err,
        );
      }
      throw err;
    }
  }
}
