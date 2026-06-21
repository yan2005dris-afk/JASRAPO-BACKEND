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

    const readingTasks = tasks.filter(
      (t: any) => t.tipoRuta === 'TOMA_LECTURA',
    );
    let metersForRoutes: any[] = [];
    if (readingTasks.length > 0) {
      const routeConditions = readingTasks.map((t: any) => ({
        comunidadId: t.comunidadId,
        ...(t.sectorId !== null && t.sectorId !== undefined
          ? { sectorId: t.sectorId }
          : {}),
      }));
      metersForRoutes =
        await this.operatorRepository.findMetersByRoutes(routeConditions);
    }

    return tasks.map((task: any) => {
      const medidor = task.medidorId
        ? medidorMap.get(task.medidorId.toString())
        : null;

      let rutaPuntos: any[] | undefined = undefined;
      if (task.tipoRuta === 'TOMA_LECTURA') {
        const matchingMeters = metersForRoutes.filter((m: any) => {
          const contrato = m.historial?.[0]?.contrato;
          if (!contrato) return false;
          return (
            contrato.comunidadId === task.comunidadId &&
            contrato.sectorId === task.sectorId
          );
        });

        matchingMeters.sort((a: any, b: any) => a.serie.localeCompare(b.serie));

        rutaPuntos = matchingMeters
          .map((m: any) => ({
            latitud: m.latitud != null ? Number(m.latitud) : null,
            longitud: m.longitud != null ? Number(m.longitud) : null,
            serie: m.serie,
            clienteNombre: m.historial?.[0]?.contrato?.cliente
              ? `${m.historial[0].contrato.cliente.nombres} ${m.historial[0].contrato.cliente.apellidos}`.trim()
              : '',
          }))
          .filter((pt: any) => pt.latitud != null && pt.longitud != null);
      }

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
        rutaPuntos,
      };
    });
  }
}
