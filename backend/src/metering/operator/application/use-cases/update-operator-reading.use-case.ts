import { Injectable } from '@nestjs/common';
import { EstadoLectura, EstadoRuta } from 'src/shared/enums';
import {
  EntityNotFoundException,
  ForbiddenDomainException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { UpdateReadingUseCase } from 'src/metering/readings/application/use-cases/update-reading.use-case';
import { ActualizarLecturaDto } from 'src/metering/readings/interfaces/dto/update-lectura.dto';
import { UpdateOperatorReadingDto } from '../../interfaces/dto/update-operator-reading.dto';
import { LecturaEntity } from 'src/metering/readings/domain/entities/lectura.entity';
import { OperatorRepository } from '../../domain/repositories/operator.repository';

export type EvidenceReplacementCleanup = (
  oldKey: string,
  newKey: string,
) => Promise<void>;

const OPERATOR_EDITABLE_ESTADOS: ReadonlySet<EstadoLectura> = new Set([
  EstadoLectura.PENDIENTE,
  EstadoLectura.RECHAZADA_VERIFICACION,
]);

@Injectable()
export class UpdateOperatorReadingUseCase {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly updateReadingUseCase: UpdateReadingUseCase,
  ) {}

  async execute(
    id: bigint,
    operarioId: number,
    updateDto: UpdateOperatorReadingDto,
    evidenciaFotoUrl?: string,
    cleanupOldEvidence?: EvidenceReplacementCleanup,
  ): Promise<LecturaEntity> {
    // 1. Validar que la lectura existe y obtener datos de ruta
    const lectura = await this.operatorRepository.findReadingWithDetails(id);
    if (!lectura) {
      throw new EntityNotFoundException('Lectura', id.toString());
    }

    // 2. Validar que hay un período activo
    const activePeriod = await this.operatorRepository.findActivePeriod();
    if (!activePeriod) {
      throw new EntityNotFoundException('Periodo', 'ABIERTO');
    }

    // 3. Obtener rutas activas del operador
    const rutas = await this.operatorRepository.findActiveRoutes(
      operarioId,
      activePeriod.periodoId,
    );
    if (rutas.length === 0) {
      throw new InvalidDomainOperationException(
        'No tenés rutas asignadas en el período activo',
      );
    }

    // 4. Verificar si la lectura está asignada explícitamente a una orden de trabajo del operario
    const matchingOrder = lectura.ordenesTrabajo?.find(
      (ot) =>
        ot.ruta?.operarioId === operarioId &&
        ot.ruta?.periodoId === activePeriod.periodoId &&
        rutas.some((ruta) => ruta.rutaId === ot.rutaId),
    );

    if (!matchingOrder) {
      throw new ForbiddenDomainException(
        'Esta lectura no está asignada a una orden de trabajo de tu ruta activa',
      );
    }

    // 5. Si la ruta asociada se encuentra en estado PENDIENTE, transicionarla a EN_PROGRESO en el primer registro
    const currentRuta = rutas.find((r) => r.rutaId === matchingOrder.rutaId);
    if (
      matchingOrder.ruta?.estado === EstadoRuta.PENDIENTE ||
      currentRuta?.estado === EstadoRuta.PENDIENTE
    ) {
      try {
        await this.operatorRepository.updateRouteState(
          matchingOrder.rutaId,
          {
            estado: EstadoRuta.EN_PROGRESO,
            fechaInicio: new Date(),
          },
          EstadoRuta.PENDIENTE,
        );
      } catch {
        // Ignorar si ya fue transicionada concurrentemente
      }
    }

    // 6. Validar que la lectura esté en un estado modificable por el operador
    if (!OPERATOR_EDITABLE_ESTADOS.has(lectura.estado as EstadoLectura)) {
      throw new InvalidDomainOperationException(
        `La lectura está en estado ${lectura.estado} y no puede ser modificada por el operador`,
      );
    }

    // 7. Delegar al UpdateReadingUseCase unificado con state machine
    const oldEvidenceKey = lectura.ordenesTrabajo?.find(
      (order) => order.evidenciaFotoUrl,
    )?.evidenciaFotoUrl;
    const updated = await this.updateReadingUseCase.execute(
      id,
      {
        ...(updateDto as ActualizarLecturaDto),
        ...(evidenciaFotoUrl ? { evidenciaFotoUrl } : {}),
      },
      EstadoLectura.POR_REVISION,
    );
    if (evidenciaFotoUrl && oldEvidenceKey && cleanupOldEvidence) {
      await cleanupOldEvidence(oldEvidenceKey, evidenciaFotoUrl);
    }
    return updated;
  }
}
