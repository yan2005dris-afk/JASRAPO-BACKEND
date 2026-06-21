import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoLectura } from 'src/shared/enums';
import { UpdateReadingUseCase } from 'src/metering/readings/application/use-cases/update-reading.use-case';
import { ActualizarLecturaDto } from 'src/metering/readings/interfaces/dto/update-lectura.dto';
import { LecturaEntity } from 'src/metering/readings/domain/entities/lectura.entity';
import { OperatorRepository } from '../../domain/repositories/operator.repository';

@Injectable()
export class UpdateOperatorReadingUseCase {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly updateReadingUseCase: UpdateReadingUseCase,
  ) {}

  async execute(
    id: bigint,
    operarioId: number,
    updateDto: ActualizarLecturaDto,
  ): Promise<LecturaEntity> {
    // 1. Validar que la lectura existe y obtener datos de ruta
    const lectura = await this.operatorRepository.findReadingWithDetails(id);
    if (!lectura) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    // 2. Validar que hay un período activo
    const activePeriod = await this.operatorRepository.findActivePeriod();
    if (!activePeriod) {
      throw new NotFoundException(
        'No hay un período de facturación ABIERTO en el sistema',
      );
    }

    // 3. Obtener rutas activas del operador
    const rutas = await this.operatorRepository.findActiveRoutes(
      operarioId,
      activePeriod.periodoId,
    );
    if (rutas.length === 0) {
      throw new ForbiddenException(
        'No tenés rutas asignadas en el período activo',
      );
    }

    // 4. Obtener el contrato activo de la lectura
    const activeHistorial = lectura.medidor?.historial?.[0];
    const contrato = activeHistorial?.contrato ?? null;
    if (!contrato) {
      throw new NotFoundException(
        'No se encontró un contrato activo para esta lectura',
      );
    }

    // 5. Verificar que la lectura pertenezca a alguna ruta del operador
    const lecturaPertenece = rutas.some((ruta) => {
      const comunidadMatch = ruta.comunidadId === contrato.comunidadId;
      const sectorMatch =
        ruta.sectorId === null || ruta.sectorId === undefined
          ? true
          : ruta.sectorId === contrato.sectorId;
      return comunidadMatch && sectorMatch;
    });

    if (!lecturaPertenece) {
      throw new ForbiddenException(
        'Esta lectura no pertenece a tu ruta asignada',
      );
    }

    // 6. Delegar al UpdateReadingUseCase unificado con state machine
    return this.updateReadingUseCase.execute(
      id,
      updateDto,
      EstadoLectura.POR_REVISION,
    );
  }
}
