import type { LecturaEntity } from '../entities/lectura.entity';
import type { Decimal } from 'decimal.js';

export interface ReadingSnapshot {
  lecturaAnterior: Decimal;
  lecturaInicial: boolean;
}

export interface CreateReadingRepositoryData {
  fecha: Date;
  lecturaAnterior: Decimal | number | string;
  lecturaActual: Decimal | number | string;
  consumoCalculado: Decimal | number | string;
  medidorId: bigint;
  descripcionAnomalia?: string | null;
  fechaValidacion?: Date | null;
  fotoUrl?: string | null;
  estado?: string;
  lecturaInicial?: boolean;
  periodoId: number;
}

export interface UpdateReadingRepositoryData {
  fecha?: Date;
  lecturaAnterior?: Decimal | number | string;
  lecturaActual?: Decimal | number | string;
  consumoCalculado?: Decimal | number | string;
  medidorId?: bigint;
  descripcionAnomalia?: string | null;
  fechaValidacion?: Date | null;
  fotoUrl?: string | null;
  estado?: string;
  lecturaInicial?: boolean;
  periodoId?: number;
  deletedAt?: Date | null;
}

export interface ReadingFilters {
  contratoId?: bigint;
  medidorId?: bigint;
  periodoId?: number;
  estado?: string;
  search?: string;
}

export interface ActivePeriod {
  periodoId: number;
}

export abstract class ReadingRepository {
  abstract findActivePeriod(): Promise<ActivePeriod | null>;

  abstract findReadingSnapshot(
    medidorId: bigint,
    fecha: Date,
  ): Promise<ReadingSnapshot | null>;

  abstract findLastApprovedActualByMeter(
    medidorId: bigint,
    fecha?: Date,
  ): Promise<Decimal | null>;

  abstract findActiveInitialReadingByMeter(
    medidorId: bigint,
    fecha?: Date,
  ): Promise<Decimal | null>;

  abstract findUnique(where: {
    lecturaId: bigint;
  }): Promise<LecturaEntity | null>;

  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: ReadingFilters;
  }): Promise<LecturaEntity[]>;

  abstract count(params: { where?: ReadingFilters }): Promise<number>;

  abstract create(data: CreateReadingRepositoryData): Promise<LecturaEntity>;

  abstract createWithAtomicSnapshot(params: {
    fecha: Date;
    lecturaActual: Decimal;
    medidorId: bigint;
    periodoId: number;
    descripcionAnomalia?: string | null;
    fotoUrl?: string | null;
    estado?: string;
  }): Promise<LecturaEntity>;

  abstract update(
    where: { lecturaId: bigint },
    data: UpdateReadingRepositoryData,
  ): Promise<LecturaEntity>;

  /**
   * Compare-And-Swap update: solo actualiza si el estado actual coincide
   * con expectedEstado. Retorna null si hubo conflicto concurrente.
   */
  abstract updateWithCas(
    where: { lecturaId: bigint; estado: string },
    data: UpdateReadingRepositoryData,
  ): Promise<LecturaEntity | null>;

  abstract isReadingLinkedToReplacement(lecturaId: bigint): Promise<boolean>;

  /**
   * Estado de la ruta a la que pertenece la lectura (vía ordenes_trabajo),
   * o null si la lectura no está asociada a ninguna ruta.
   */
  abstract findRouteStateByReadingId(lecturaId: bigint): Promise<string | null>;
}
