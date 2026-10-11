import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { FindOrdenesByRutaUseCase } from './use-cases/find-ordenes-by-ruta.use-case';
import { UpdateOrdenEstadoUseCase } from './use-cases/update-orden-estado.use-case';
import { OrdenTrabajoRepository } from '../domain/repositories/orden-trabajo.repository';
import type { OrdenTrabajoRow } from 'src/operations/routes/infrastructure/repositories/route.include';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import type {
  OrdenTrabajoFilters,
  UpdateOrdenEstadoData,
} from '../domain/types/orden-trabajo.types';
import type { PaginateOptions } from 'src/shared/pagination/pagination.util';
import type { TipoActividad } from '../domain/types/tipo-actividad.type';

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordenTrabajoRepository: OrdenTrabajoRepository,
    private readonly findOrdenesByRutaUseCase: FindOrdenesByRutaUseCase,
    private readonly updateOrdenEstadoUseCase: UpdateOrdenEstadoUseCase,
  ) {}

  /**
   * Returns the canonical catalog of active activity types.
   * Replaces the legacy `GET /routes/activity-types` and
   * `GET /operator/activity-types` endpoints.
   */
  async getActivityTypes(): Promise<TipoActividad[]> {
    const tipos = await this.prisma.tipoActividad.findMany({
      where: { activo: true },
      orderBy: { tipoActividadId: 'asc' },
    });
    return tipos.map((t) => ({
      tipoActividadId: Number(t.tipoActividadId),
      codigo: t.codigo,
      nombre: t.nombre,
      descripcion: t.descripcion,
      icono: (t as { icono?: string | null }).icono ?? null,
      activo: t.activo,
    }));
  }

  async findByRuta(params: {
    rutaId: bigint;
    filters?: Partial<OrdenTrabajoFilters>;
    pagination: PaginateOptions;
  }): Promise<PaginatedResult<OrdenTrabajoRow>> {
    return this.findOrdenesByRutaUseCase.execute(params);
  }

  async updateEstado(
    ordenTrabajoId: bigint,
    data: UpdateOrdenEstadoData,
    operarioId: number,
  ): Promise<OrdenTrabajoRow> {
    return this.updateOrdenEstadoUseCase.execute(
      ordenTrabajoId,
      data,
      operarioId,
    );
  }
}
