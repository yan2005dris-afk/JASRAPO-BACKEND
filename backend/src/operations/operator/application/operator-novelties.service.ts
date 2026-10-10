import { Injectable, NotFoundException } from '@nestjs/common';
import { OperatorRepository } from '../domain/repositories/operator.repository';
import type {
  OperatorNoveltyFilters,
  OperatorNoveltyRow,
} from '../domain/types/operator-novelty.types';
import { WorkOrderNoveltyService } from 'src/operations/work-order-novelties/application/work-order-novelty.service';
import type { UpdateWorkOrderNoveltyDto } from 'src/operations/work-order-novelties/interfaces/dto/update-work-order-novelty.dto';

@Injectable()
export class OperatorNoveltiesService {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly novelties: WorkOrderNoveltyService,
  ) {}

  private toResponse(row: OperatorNoveltyRow) {
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

  async list(
    operarioId: number,
    page = 1,
    limit = 100,
    filters?: OperatorNoveltyFilters,
  ) {
    const { data, total } = await this.operatorRepository.findOperatorNovelties(
      {
        operarioId,
        page,
        limit,
        filters,
      },
    );
    return { data: data.map((row) => this.toResponse(row)), total };
  }

  async findOne(operarioId: number, id: bigint) {
    const row = await this.operatorRepository.findOperatorNovelty(
      operarioId,
      id,
    );
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
