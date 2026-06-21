import { Injectable, NotFoundException } from '@nestjs/common';
import { MeterEntity } from 'src/metering/meters/domain/entities/meter.entity';
import { EstadoMedidor } from 'src/shared/enums';
import { OperatorRepository } from '../../domain/repositories/operator.repository';

@Injectable()
export class SyncAllUseCase {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(operarioId: number): Promise<MeterEntity[]> {
    // 1. Find the active billing period
    const activePeriod = await this.operatorRepository.findActivePeriod();

    if (!activePeriod) {
      throw new NotFoundException(
        'No hay un período de facturación ABIERTO en el sistema',
      );
    }

    // 2. Find operator's active rutas for this period
    const rutas = await this.operatorRepository.findActiveRoutes(
      operarioId,
      activePeriod.periodoId,
    );

    // 3. No routes → return empty
    if (rutas.length === 0) {
      return [];
    }

    // 4. Build OR conditions for each ruta's comunidad/sector combination
    const rutaConditions = rutas.map((ruta) => ({
      comunidadId: ruta.comunidadId,
      ...(ruta.sectorId !== null && ruta.sectorId !== undefined
        ? { sectorId: ruta.sectorId }
        : {}),
    }));

    // 5. Query meters with active historial matching the operator's routes
    const meters =
      await this.operatorRepository.findMetersByRoutes(rutaConditions);

    // 6. Map to MeterEntity[]
    return meters.map((m: any) => {
      const activeHistorial = m.historial?.[0];
      return new MeterEntity({
        medidorId: m.medidorId,
        marca: m.marca,
        modelo: m.modelo,
        serie: m.serie,
        estado: m.estado as EstadoMedidor,
        fechaInstalacion: m.fechaInstalacion,
        fechaBaja: m.fechaBaja,
        motivo: m.motivo,
        latitud: m.latitud != null ? Number(m.latitud) : null,
        longitud: m.longitud != null ? Number(m.longitud) : null,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        deletedAt: m.deletedAt,
        contratoId: activeHistorial?.contrato?.contratoId ?? null,
        clienteNombre: activeHistorial?.contrato?.cliente
          ? `${activeHistorial.contrato.cliente.nombres} ${activeHistorial.contrato.cliente.apellidos}`.trim()
          : null,
      });
    });
  }
}
