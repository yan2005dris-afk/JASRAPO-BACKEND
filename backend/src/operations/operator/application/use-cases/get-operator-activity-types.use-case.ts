import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
export interface ITipoActividad {
  tipoActividadId: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  activo: boolean;
}

@Injectable()
export class GetOperatorActivityTypesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<ITipoActividad[]> {
    const tipos = await this.prisma.tipoActividad.findMany({
      where: { activo: true },
      orderBy: { tipoActividadId: 'asc' },
    });
    return tipos.map((t) => ({
      tipoActividadId: Number(t.tipoActividadId),
      codigo: t.codigo,
      nombre: t.nombre,
      descripcion: t.descripcion,
      icono: (t as any).icono || null, // in case it is added in the future
      activo: t.activo,
    }));
  }
}
