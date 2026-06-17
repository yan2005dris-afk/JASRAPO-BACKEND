import type { EmisorRecord } from '../interfaces/repository.interface';
import { PuntoEmisionRecord } from '../interfaces/repository.interface';

export abstract class EmisorRepository {
  abstract findAll(): Promise<EmisorRecord[]>;
  abstract findById(id: number): Promise<EmisorRecord | null>;
  abstract findByRuc(ruc: string): Promise<EmisorRecord | null>;

  abstract create(data: Partial<EmisorRecord>): Promise<EmisorRecord>;
  abstract update(id: number, data: Partial<EmisorRecord>): Promise<EmisorRecord>;

  abstract findPuntoEmision(
    emisorId: number,
    establecimiento: string,
    puntoEmision: string,
  ): Promise<{ punto_emision_id: number; establecimiento_id: number } | null>;

  abstract clearCache(): void;
}
