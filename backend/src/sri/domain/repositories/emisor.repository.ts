import { EmisorRecord, PuntoEmisionRecord } from '../interfaces/repository.interface';

export abstract class EmisorRepository {
  abstract findByRuc(ruc: string): Promise<EmisorRecord | null>;
  
  abstract findPuntoEmision(
    emisorId: number,
    establecimiento: string,
    puntoEmision: string,
  ): Promise<{ punto_emision_id: number; establecimiento_id: number } | null>;

  abstract clearCache(): void;
}
