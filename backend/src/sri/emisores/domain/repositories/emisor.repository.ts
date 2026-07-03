import type { EmisorRecord } from '../../../domain/interfaces/repository.interface';

export type CreateEmisorInput = Omit<
  EmisorRecord,
  'id' | 'createdAt' | 'updatedAt' | 'certificado_p12' | 'certificado_password'
>;

export type UpdateEmisorInput = Partial<
  Omit<
    EmisorRecord,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'ruc'
    | 'certificado_p12'
    | 'certificado_password'
    | 'certificado_nombre'
    | 'certificado_password_encrypted'
    | 'certificado_valido_hasta'
    | 'certificado_sujeto'
  >
> & {
  certificado_nombre?: string | null;
  certificado_password_encrypted?: string | null;
  certificado_valido_hasta?: Date | null;
  certificado_sujeto?: string | null;
};

export abstract class EmisorRepository {
  abstract findAll(): Promise<EmisorRecord[]>;
  abstract findById(id: number): Promise<EmisorRecord | null>;
  abstract findByRuc(ruc: string): Promise<EmisorRecord | null>;

  abstract create(data: CreateEmisorInput): Promise<EmisorRecord>;
  abstract update(id: number, data: UpdateEmisorInput): Promise<EmisorRecord>;

  abstract findPuntoEmision(
    emisorId: number,
    establecimiento: string,
    puntoEmision: string,
  ): Promise<{ punto_emision_id: number; establecimiento_id: number } | null>;

  abstract clearCache(): void;
}
