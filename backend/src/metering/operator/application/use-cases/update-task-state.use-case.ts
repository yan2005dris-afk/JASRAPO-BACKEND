import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoRuta, EstadoMedidor } from 'src/shared/enums';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import type { OperatorTask } from '../../domain/repositories/repository-types';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import type { TaskResponseDto } from '../../interfaces/dto/task-response.dto';
import type { UpdateTaskDto } from '../../interfaces/dto/update-task.dto';

/** Duck-type check for Prisma P2025 (record not found / optimistic lock failure). */
function isP2025Error(error: unknown): error is Error & { code: string } {
  return (
    error instanceof Error &&
    error.name === 'PrismaClientKnownRequestError' &&
    (error as { code?: string }).code === 'P2025'
  );
}

// Valid transitions: current -> set of allowed next states
const ALLOWED_TRANSITIONS: Record<string, ReadonlySet<string>> = {
  [EstadoRuta.PENDIENTE]: new Set([
    EstadoRuta.EN_PROGRESO,
    EstadoRuta.COMPLETADA,
    EstadoRuta.CANCELADA,
  ]),
  [EstadoRuta.EN_PROGRESO]: new Set([
    EstadoRuta.COMPLETADA,
    EstadoRuta.CANCELADA,
  ]),
};

// Terminal states cannot transition anywhere
const TERMINAL_STATES = new Set<string>([
  EstadoRuta.COMPLETADA,
  EstadoRuta.CANCELADA,
]);

@Injectable()
export class UpdateTaskStateUseCase {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly meterRepository: MeterRepository,
  ) {}

  async execute(
    rutaId: bigint,
    operarioId: number,
    dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const { estado: nuevoEstado, observacion } = dto;

    // 1. Find active period
    const activePeriod = await this.operatorRepository.findActivePeriod();
    if (!activePeriod) {
      throw new NotFoundException(
        'No hay un período de facturación ABIERTO en el sistema',
      );
    }

    // 2. Find the task and verify operator ownership
    const tasks = await this.operatorRepository.findTasksByOperator(
      operarioId,
      activePeriod.periodoId,
    );

    const task = tasks.find(
      (t) => t.rutaId === rutaId || t.rutaId?.toString() === rutaId?.toString(),
    );

    if (!task) {
      throw new NotFoundException(
        `Tarea con ID ${rutaId} no encontrada o no pertenece al operador`,
      );
    }

    if (task.operarioId !== operarioId) {
      throw new ForbiddenException(
        'Esta tarea no pertenece al operador autenticado',
      );
    }

    // 3. Validate state transition
    const currentEstado = task.estado;

    if (TERMINAL_STATES.has(currentEstado)) {
      throw new BadRequestException(
        `La tarea está en estado terminal ${currentEstado} y no puede modificarse`,
      );
    }

    const allowedNext = ALLOWED_TRANSITIONS[currentEstado];
    if (!allowedNext || !allowedNext.has(nuevoEstado)) {
      throw new BadRequestException(
        `Transición inválida: de ${currentEstado} a ${nuevoEstado}`,
      );
    }

    // 4. CANCELADA requires observacion
    if (
      nuevoEstado === EstadoRuta.CANCELADA &&
      (!observacion || observacion.trim().length === 0)
    ) {
      throw new BadRequestException(
        'La cancelación requiere una observación que explique el motivo',
      );
    }

    // 5. Build update data with timestamps
    const updateData: Record<string, any> = { estado: nuevoEstado };

    if (nuevoEstado === EstadoRuta.EN_PROGRESO) {
      updateData.fechaInicio = new Date();
    }

    if (nuevoEstado === EstadoRuta.COMPLETADA) {
      updateData.fechaFin = new Date();
    }

    if (observacion !== undefined) {
      updateData.observacion = observacion;
    }

    // 6. Apply state transition with optimistic concurrency
    let updated: OperatorTask;

    if (
      nuevoEstado === EstadoRuta.COMPLETADA &&
      task.tipoRuta === 'INSTALACION' &&
      task.medidorId != null
    ) {
      // Atomic: task + meter update in a single transaction
      try {
        updated = await this.operatorRepository.completeInstallationTask(
          rutaId,
          updateData,
          currentEstado,
          {
            medidorId: task.medidorId,
            estado: EstadoMedidor.INSTALADO,
            fechaInstalacion: new Date(),
          },
        );
      } catch (error) {
        if (isP2025Error(error)) {
          throw new ConflictException(
            'Conflicto de concurrencia: la tarea fue modificada por otro request',
          );
        }
        throw error;
      }
    } else {
      // Regular transition with optimistic locking
      try {
        updated = await this.operatorRepository.updateTaskState(
          rutaId,
          updateData,
          currentEstado,
        );
      } catch (error) {
        if (isP2025Error(error)) {
          throw new ConflictException(
            'Conflicto de concurrencia: la tarea fue modificada por otro request',
          );
        }
        throw error;
      }
    }

    // 7. Return response DTO
    return {
      rutaId: (updated.rutaId ?? rutaId).toString(),
      tipoRuta: task.tipoRuta,
      nombre: task.nombre,
      descripcion: task.descripcion ?? undefined,
      estado: nuevoEstado,
      orden: task.orden,
      observacion: observacion ?? task.observacion ?? undefined,
      fechaLimite: task.fechaLimite?.toISOString() ?? undefined,
      operarioId: task.operarioId,
      comunidadId: task.comunidadId,
      sectorId: task.sectorId ?? undefined,
      fechaPlanificada: task.fechaPlanificada?.toISOString() ?? undefined,
      fechaInicio:
        updateData.fechaInicio?.toISOString() ??
        task.fechaInicio?.toISOString() ??
        undefined,
      fechaFin:
        updateData.fechaFin?.toISOString() ??
        task.fechaFin?.toISOString() ??
        undefined,
      medidor: task.medidorId
        ? { medidorId: task.medidorId.toString(), serie: '' }
        : null,
      operario: {
        usuarioId: operarioId,
        nombres: '',
        apellidos: '',
      },
    };
  }
}
