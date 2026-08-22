import { Injectable } from '@nestjs/common';
import { EstadoRuta, EstadoMedidor } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import type {
  OperatorTask,
  TaskStateUpdate,
} from '../../domain/repositories/repository-types';
import type { UpdateTaskDto } from '../../interfaces/dto/update-task.dto';

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
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(
    rutaId: bigint,
    operarioId: number,
    dto: UpdateTaskDto,
  ): Promise<OperatorTask> {
    const { estado: nuevoEstado, observacion } = dto;

    // 1. Find active period
    const activePeriod = await this.operatorRepository.findActivePeriod();
    if (!activePeriod) {
      throw new EntityNotFoundException('Periodo', 'ABIERTO');
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
      throw new EntityNotFoundException('Tarea', rutaId.toString());
    }

    if (task.operarioId !== operarioId) {
      throw new InvalidDomainOperationException(
        'Esta tarea no pertenece al operador autenticado',
      );
    }

    // 3. Validate state transition
    const currentEstado = task.estado;

    if (TERMINAL_STATES.has(currentEstado)) {
      throw new InvalidDomainOperationException(
        `La tarea está en estado terminal ${currentEstado} y no puede modificarse`,
      );
    }

    const allowedNext = ALLOWED_TRANSITIONS[currentEstado];
    if (!allowedNext || !allowedNext.has(nuevoEstado)) {
      throw new InvalidDomainOperationException(
        `Transición inválida: de ${currentEstado} a ${nuevoEstado}`,
      );
    }

    // 4. CANCELADA requires observacion
    if (
      nuevoEstado === EstadoRuta.CANCELADA &&
      (!observacion || observacion.trim().length === 0)
    ) {
      throw new InvalidDomainOperationException(
        'La cancelación requiere una observación que explique el motivo',
      );
    }

    // 5. Build update data with timestamps
    const updateData: TaskStateUpdate = { estado: nuevoEstado };

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
    //    (concurrency conflicts surface as InvalidDomainOperationException
    //     from the repository, not as Prisma P2025 errors)
    if (
      nuevoEstado === EstadoRuta.COMPLETADA &&
      task.tipoRuta === 'INSTALACION' &&
      task.medidorId != null
    ) {
      // Atomic: task + meter update in a single transaction
      return this.operatorRepository.completeInstallationTask(
        rutaId,
        updateData,
        currentEstado,
        {
          medidorId: task.medidorId,
          estado: EstadoMedidor.INSTALADO,
          fechaInstalacion: new Date(),
        },
      );
    }

    // Regular transition with optimistic locking
    return this.operatorRepository.updateTaskState(
      rutaId,
      updateData,
      currentEstado,
    );
  }
}
