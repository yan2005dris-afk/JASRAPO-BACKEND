import type {
  ReadingContractRef,
  ReadingMeterRef,
  ReadingPeriodRef,
} from '../types/reading-relations';

export class LecturaEntity {
  lecturaId: bigint;
  fecha: Date;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoCalculado: number;
  medidorId: bigint;
  descripcionAnomalia: string | null;
  fechaValidacion: Date | null;
  fotoUrl: string | null;
  isValidada: boolean;
  lecturaInicial: boolean;
  periodoId: number;
  tieneAnomalia: boolean;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Relaciones opcionales del dominio
  contrato?: ReadingContractRef | null;
  medidor?: ReadingMeterRef | null;
  periodoRel?: ReadingPeriodRef | null;

  constructor(partial: Partial<LecturaEntity>) {
    Object.assign(this, partial);
  }
}
