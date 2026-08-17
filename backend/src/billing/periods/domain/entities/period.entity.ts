import { EstadoPeriodo } from 'src/generated/prisma/enums';

export class PeriodEntity {
  periodoId: number;
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  fechaVencimiento: Date;
  estado: EstadoPeriodo;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<PeriodEntity>) {
    Object.assign(this, partial);
  }
}
