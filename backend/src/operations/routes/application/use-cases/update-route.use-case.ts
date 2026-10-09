import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { UpdateRouteDto } from '../../interfaces/dto/update-route.dto';
import type { RouteRow } from '../../infrastructure/repositories/route.include';
import type { UpdateRouteData } from '../../domain/types/route.types';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { canTransitionRouteState } from '../../domain/route-state';

@Injectable()
export class UpdateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(rutaId: bigint, updateDto: UpdateRouteDto): Promise<RouteRow> {
    const ruta = await this.routeRepository.findById(rutaId);

    if (!ruta) {
      throw new EntityNotFoundException('Ruta', rutaId.toString());
    }

    if (updateDto.estado !== undefined && updateDto.estado !== ruta.estado) {
      if (!canTransitionRouteState(ruta.estado, updateDto.estado)) {
        throw new InvalidDomainOperationException(
          `No se puede cambiar el estado de la ruta de ${ruta.estado} a ${updateDto.estado}`,
        );
      }

      if (
        updateDto.estado === 'EN_PROGRESO' &&
        !ruta.operarioId &&
        updateDto.operarioId === undefined
      ) {
        throw new InvalidDomainOperationException(
          'No se puede iniciar la ruta: debe asignar un operario responsable antes de enviarla a campo',
        );
      }
    }

    if (updateDto.periodoId !== undefined) {
      const periodo = await this.routeRepository.findPeriodo(
        updateDto.periodoId,
      );

      if (!periodo) {
        throw new EntityNotFoundException('Periodo', updateDto.periodoId);
      }

      if (periodo.estado !== 'ABIERTO') {
        throw new InvalidDomainOperationException('El periodo no está abierto');
      }

      const overlapping = await this.routeRepository.findOverlappingRoutes(
        ruta.comunidadId,
        updateDto.periodoId,
        ruta.sectorId ?? undefined,
        ruta.tipoActividad.codigo,
      );

      if (overlapping.some((r) => r.rutaId !== rutaId)) {
        throw new InvalidDomainOperationException(
          'Ya existe una ruta planificada para esta comunidad en este periodo',
        );
      }
    }

    const estadoFinal = updateDto.estado;

    const payload: UpdateRouteData = {
      ...(updateDto.nombre !== undefined && { nombre: updateDto.nombre }),
      ...(updateDto.descripcion !== undefined && {
        descripcion: updateDto.descripcion,
      }),
      ...(updateDto.operarioId !== undefined && {
        operarioId: updateDto.operarioId,
      }),
      ...(updateDto.estado !== undefined && { estado: estadoFinal }),
      ...(updateDto.periodoId !== undefined && {
        periodoId: updateDto.periodoId,
      }),
    };

    if (estadoFinal === 'EN_PROGRESO' && !ruta.fechaInicio) {
      payload.fechaInicio = new Date();
    } else if (
      (estadoFinal === 'COMPLETADA' || estadoFinal === 'PARCIAL') &&
      !ruta.fechaFin
    ) {
      payload.fechaFin = new Date();
    }

    return updateDto.estado !== undefined
      ? this.routeRepository.updateWithReadingKpis(rutaId, ruta.estado, payload)
      : this.routeRepository.update(rutaId, payload);
  }
}
