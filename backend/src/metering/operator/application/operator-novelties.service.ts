import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { WorkOrderNoveltyService } from 'src/operations/work-order-novelties/application/work-order-novelty.service';
import type { UpdateWorkOrderNoveltyDto } from 'src/operations/work-order-novelties/interfaces/dto/update-work-order-novelty.dto';

@Injectable()
export class OperatorNoveltiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly novelties: WorkOrderNoveltyService,
  ) {}

  private readonly detail = {
    ordenTrabajo: {
      select: {
        contratoId: true,
        medidorId: true,
        medidor: { select: { serie: true } },
        contrato: {
          select: {
            numeroGuia: true,
            direccionSuministro: true,
            cliente: {
              select: { nombres: true, apellidos: true, razonSocial: true },
            },
          },
        },
        ruta: {
          select: {
            comunidadId: true,
            sectorId: true,
            comunidad: { select: { nombre: true } },
            sector: { select: { nombre: true } },
          },
        },
      },
    },
  } as const;

  private readonly visibleTo = (operarioId: number) => ({
    deletedAt: null,
    ordenTrabajo: { ruta: { operarioId } },
  });

  private toResponse(row: any) {
    const order = row.ordenTrabajo;
    const client = order.contrato.cliente;
    const ruta = order.ruta;
    return {
      novedadId: String(row.novedadId),
      ordenTrabajoId: String(row.ordenTrabajoId),
      lecturaId: row.lecturaId == null ? null : String(row.lecturaId),
      medidorId: order.medidorId == null ? null : String(order.medidorId),
      medidorSerie: order.medidor?.serie ?? `OT-${row.ordenTrabajoId}`,
      contratoId: String(order.contratoId),
      numeroGuia: order.contrato.numeroGuia,
      clienteNombre:
        client.razonSocial ||
        [client.nombres, client.apellidos].filter(Boolean).join(' '),
      direccionSuministro: order.contrato.direccionSuministro,
      comunidadId: ruta?.comunidadId ?? null,
      comunidadNombre: ruta?.comunidad?.nombre ?? null,
      sectorId: ruta?.sectorId ?? null,
      sectorNombre: ruta?.sector?.nombre ?? null,
      tipo: row.tipo,
      observacion: row.observacion,
      estado: row.estado,
      fotoUrl: row.fotoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async list(operarioId: number, page = 1, limit = 100) {
    const where = this.visibleTo(operarioId);
    const [rows, total] = await Promise.all([
      this.prisma.novedadOrdenTrabajo.findMany({
        where,
        include: this.detail,
        orderBy: [{ createdAt: 'desc' }, { novedadId: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.novedadOrdenTrabajo.count({ where }),
    ]);
    return { data: rows.map((row) => this.toResponse(row)), total };
  }

  async findOne(operarioId: number, id: bigint) {
    const row = await this.prisma.novedadOrdenTrabajo.findFirst({
      where: { ...this.visibleTo(operarioId), novedadId: id },
      include: this.detail,
    });
    if (!row) throw new NotFoundException(`Novedad con ID ${id} no encontrada`);
    return this.toResponse(row);
  }

  async update(
    operarioId: number,
    id: bigint,
    dto: UpdateWorkOrderNoveltyDto,
    file?: Express.Multer.File,
  ) {
    await this.findOne(operarioId, id);
    await this.novelties.update(id, dto, file, operarioId);
    return this.findOne(operarioId, id);
  }
}
