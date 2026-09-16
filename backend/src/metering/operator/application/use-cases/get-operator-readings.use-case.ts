import { Injectable } from '@nestjs/common';
import type { ResponseReadingDto } from 'src/metering/readings/interfaces/dto/response-reading.dto';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { OperatorRepository } from '../../domain/repositories/operator.repository';

@Injectable()
export class GetOperatorReadingsUseCase {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(operarioId: number): Promise<ResponseReadingDto[]> {
    // 1. Find the active billing period
    const activePeriod = await this.operatorRepository.findActivePeriod();

    if (!activePeriod) {
      throw new EntityNotFoundException('Periodo', 'ABIERTO');
    }

    // 2. Find operator's active rutas for this period
    const rutas = await this.operatorRepository.findActiveRoutes(
      operarioId,
      activePeriod.periodoId,
    );

    // 3. No routes assigned → return empty list (not 404)
    if (rutas.length === 0) {
      return [];
    }

    // 4. Query lecturas that belong to any of the operator's rutas
    const lecturas =
      await this.operatorRepository.findReadingsByPeriodAndRoutes(
        activePeriod.periodoId,
        rutas,
      );

    // 5. Map raw Prisma results to ResponseReadingDto
    return lecturas.map((lectura) => {
      const activeHistorial = lectura.medidor?.historial?.[0];
      const contrato = activeHistorial?.contrato ?? null;

      return {
        lecturaId: lectura.lecturaId.toString(),
        fecha: lectura.fecha,
        lecturaAnterior: Number(lectura.lecturaAnterior),
        lecturaActual: Number(lectura.lecturaActual),
        consumoCalculado: Number(lectura.consumoCalculado),
        contratoId: contrato ? contrato.contratoId.toString() : '',
        descripcionAnomalia: lectura.descripcionAnomalia,
        fechaValidacion: lectura.fechaValidacion,
        evidenciaFotoUrl: lectura.evidenciaFotoUrl,
        // Computed fields — not stored in DB
        isValidada: lectura.estado !== 'PENDIENTE',
        tieneAnomalia: !!lectura.descripcionAnomalia,
        lecturaInicial: lectura.lecturaInicial,
        periodoId: lectura.periodoId,
        estado: lectura.estado,
        contrato: contrato
          ? {
              contratoId: contrato.contratoId.toString(),
              numeroGuia: contrato.numeroGuia,
              direccionSuministro: contrato.direccionSuministro,
              estadoServicio: contrato.estadoServicio,
            }
          : null,
        medidor: lectura.medidor
          ? {
              medidorId: lectura.medidor.medidorId.toString(),
              serie: lectura.medidor.serie,
              marca: lectura.medidor.marca,
              modelo: lectura.medidor.modelo,
            }
          : null,
        periodoRel: lectura.periodoRel
          ? {
              periodoId: lectura.periodoRel.periodoId,
              nombre: lectura.periodoRel.nombre,
              fechaInicio: lectura.periodoRel.fechaInicio,
              fechaFin: lectura.periodoRel.fechaFin,
            }
          : null,
      };
    });
  }
}
