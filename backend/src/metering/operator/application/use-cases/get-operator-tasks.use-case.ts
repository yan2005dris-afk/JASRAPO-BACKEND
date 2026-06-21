import { Injectable, NotFoundException } from '@nestjs/common';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import type { TaskResponseDto } from '../../interfaces/dto/task-response.dto';

@Injectable()
export class GetOperatorTasksUseCase {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(
    operarioId: number,
    tipoRuta?: string,
  ): Promise<TaskResponseDto[]> {
    const activePeriod = await this.operatorRepository.findActivePeriod();

    if (!activePeriod) {
      throw new NotFoundException(
        'No hay un período de facturación ABIERTO en el sistema',
      );
    }

    const tasks = await this.operatorRepository.findTasksByOperator(
      operarioId,
      activePeriod.periodoId,
      tipoRuta,
    );

    if (tasks.length === 0) {
      return [];
    }

    // Enrich with medidor details via repository (keeps hexagonal boundary)
    const medidorIds = tasks
      .filter((t: any) => t.medidorId != null)
      .map((t: any) => t.medidorId);

    let medidores: any[] = [];
    if (medidorIds.length > 0) {
      medidores = await this.operatorRepository.findMedidoresById(medidorIds);
    }

    const medidorMap = new Map(
      medidores.map((m) => [m.medidorId.toString(), m]),
    );

    return tasks.map((task: any) => {
      const medidor = task.medidorId
        ? medidorMap.get(task.medidorId.toString())
        : null;

      return {
        rutaId: task.rutaId.toString(),
        tipoRuta: task.tipoRuta,
        nombre: task.nombre,
        descripcion: task.descripcion ?? undefined,
        estado: task.estado,
        orden: task.orden,
        observacion: task.observacion ?? undefined,
        fechaLimite: task.fechaLimite?.toISOString() ?? undefined,
        operarioId: task.operarioId,
        comunidadId: task.comunidadId,
        sectorId: task.sectorId ?? undefined,
        fechaPlanificada: task.fechaPlanificada?.toISOString() ?? undefined,
        fechaInicio: task.fechaInicio?.toISOString() ?? undefined,
        fechaFin: task.fechaFin?.toISOString() ?? undefined,
        medidor: medidor
          ? {
              medidorId: medidor.medidorId.toString(),
              serie: medidor.serie,
              latitud: medidor.latitud ?? undefined,
              longitud: medidor.longitud ?? undefined,
            }
          : null,
        operario: {
          usuarioId: operarioId,
          nombres: '',
          apellidos: '',
        },
      };
    });
  }
}
