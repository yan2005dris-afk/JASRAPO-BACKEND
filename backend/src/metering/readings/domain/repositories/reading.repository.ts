import type { LecturaEntity } from '../entities/lectura.entity';

export interface CreateReadingRepositoryData {
  fecha: Date;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoCalculado: number;
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
  lecturaAnterior?: number;
  lecturaActual?: number;
  consumoCalculado?: number;
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
}

export abstract class ReadingRepository {
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
}
