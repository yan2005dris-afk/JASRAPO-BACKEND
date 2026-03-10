import { Type } from 'class-transformer';

export class LecturaEntity {
  @Type(() => String)
  lecturaId: bigint;

  @Type(() => String)
  clienteMedidorId: bigint | null;

  fecha: Date;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoCalculado: number | null;
  valorMonetario: number | null;
  abono: number | null;
  saldoPendiente: number | null;

  @Type(() => Date)
  deletedAt: Date | null;

  constructor(partial: Partial<LecturaEntity>) {
    Object.assign(this, partial);
  }
}