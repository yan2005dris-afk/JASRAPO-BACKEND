import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { UpdateRouteDto } from '../../interfaces/dto/update-route.dto';
import { RouteEntity } from '../../domain/entities/route.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { canTransitionRouteState } from '../../domain/route-state';
import { DateUtil } from 'src/shared/utils/date.util';

@Injectable()
export class UpdateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(
    rutaId: bigint,
    updateDto: UpdateRouteDto,
  ): Promise<RouteEntity> {
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

      const fechaPlan = updateDto.fechaPlanificada
        ? DateUtil.parseFrontendDate(updateDto.fechaPlanificada)
        : ruta.fechaPlanificada
          ? DateUtil.parseFrontendDate(ruta.fechaPlanificada)
          : null;

      const overlapping = await this.routeRepository.findOverlappingRoutes(
        ruta.comunidadId,
        updateDto.periodoId,
        ruta.sectorId ?? undefined,
        fechaPlan,
        ruta.tipoRuta,
      );

      if (overlapping.some((r) => r.rutaId !== rutaId)) {
        throw new InvalidDomainOperationException(
          'Ya existe una ruta planificada para esta comunidad en el mismo mes y período',
        );
      }
    }

    const payload: any = {
      ...(updateDto.nombre !== undefined && { nombre: updateDto.nombre }),
      ...(updateDto.descripcion !== undefined && {
        descripcion: updateDto.descripcion,
      }),
      ...(updateDto.estado !== undefined && { estado: updateDto.estado }),
      ...(updateDto.fechaPlanificada !== undefined && {
        fechaPlanificada: DateUtil.parseFrontendDate(
          updateDto.fechaPlanificada ?? null,
        ),
      }),
      ...(updateDto.periodoId !== undefined && {
        periodoId: updateDto.periodoId,
      }),
    };

    if (updateDto.estado === 'EN_PROGRESO' && !ruta.fechaInicio) {
      payload.fechaInicio = new Date();
    } else if (updateDto.estado === 'COMPLETADA' && !ruta.fechaFin) {
      payload.fechaFin = new Date();
    }

    return this.routeRepository.update(rutaId, payload);
  }
}
