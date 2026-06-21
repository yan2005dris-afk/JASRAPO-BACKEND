import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  HaversineService,
  type GeoPoint,
} from '../../domain/services/haversine.service';

@Injectable()
export class RecalculateRouteOrderUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recalculate the geographic orden for all active (non-completed,
   * non-cancelled) tasks in a given zona using Nearest Neighbor + haversine.
   *
   * Tasks without medidor coordinates are placed at the end of the order.
   */
  async execute(comunidadId: number, sectorId: number | null): Promise<void> {
    // 1. Find active tasks in the zone that have a medidor with coordinates
    const where: any = {
      comunidadId,
      deletedAt: null,
      estado: { notIn: ['CANCELADA', 'COMPLETADA'] },
      medidorId: { not: null },
    };

    if (sectorId !== null && sectorId !== undefined) {
      where.sectorId = sectorId;
    }

    const tasks = await this.prisma.rutas.findMany({
      where,
      include: {
        medidor: {
          select: { latitud: true, longitud: true },
        },
      },
    });

    if (tasks.length === 0) return;

    // 2. Build GeoPoints from tasks that have valid coordinates
    const geoPoints: GeoPoint[] = [];
    const noCoordIds: bigint[] = [];

    for (const task of tasks) {
      if (task.medidor?.latitud != null && task.medidor?.longitud != null) {
        geoPoints.push({
          id: task.rutaId,
          lat: Number(task.medidor.latitud),
          lng: Number(task.medidor.longitud),
        });
      } else {
        noCoordIds.push(task.rutaId);
      }
    }

    // 3. Apply nearest-neighbor ordering
    const orderedIds = HaversineService.nearestNeighbor(geoPoints);

    // 4. Tasks without coordinates go at the end
    const allOrdered = [...orderedIds, ...noCoordIds];

    // 5. Batch update orden values
    const updates = allOrdered.map((rutaId, index) =>
      this.prisma.rutas.update({
        where: { rutaId },
        data: { orden: index },
      }),
    );

    await Promise.all(updates);
  }
}
