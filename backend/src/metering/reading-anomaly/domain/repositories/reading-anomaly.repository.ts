import { ReadingAnomalyEntity } from '../entities/reading-anomaly.entity';
import { TipoAnomalia, EstadoAnomalia } from 'src/generated/prisma/client';

export interface CreateReadingAnomalyRepositoryData {
  lecturaId: bigint;
  observacion?: string | null;
  tipo: TipoAnomalia;
  estado: EstadoAnomalia;
  fotoUrlMinIo?: string | null;
}

export interface UpdateReadingAnomalyRepositoryData {
  lecturaId?: bigint;
  observacion?: string | null;
  tipo?: TipoAnomalia;
  estado?: EstadoAnomalia;
  fotoUrlMinIo?: string | null;
  deletedAt?: Date | null;
}

export interface ReadingAnomalyFilters {
  lecturaId?: bigint;
  tipo?: TipoAnomalia;
  estado?: EstadoAnomalia;
}

export abstract class ReadingAnomalyRepository {
  abstract findUnique(where: {
    anomaliaId: bigint;
  }): Promise<ReadingAnomalyEntity | null>;

  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: ReadingAnomalyFilters;
  }): Promise<ReadingAnomalyEntity[]>;

  abstract count(params: {
    where?: ReadingAnomalyFilters;
  }): Promise<number>;

  abstract create(
    data: CreateReadingAnomalyRepositoryData,
  ): Promise<ReadingAnomalyEntity>;

  abstract update(
    where: { anomaliaId: bigint },
    data: UpdateReadingAnomalyRepositoryData,
  ): Promise<ReadingAnomalyEntity>;
}
