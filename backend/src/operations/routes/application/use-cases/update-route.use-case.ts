import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { UpdateRouteDto } from '../../interfaces/dto/update-route.dto';
import { RouteEntity } from '../../domain/entities/route.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

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
      );

      if (overlapping.some((r) => r.rutaId !== rutaId)) {
        throw new InvalidDomainOperationException(
          'Ya existe una ruta para esta comunidad y periodo',
        );
      }
    }

    return this.routeRepository.update(rutaId, {
      ...(updateDto.nombre !== undefined && { nombre: updateDto.nombre }),
      ...(updateDto.descripcion !== undefined && {
        descripcion: updateDto.descripcion,
      }),
      ...(updateDto.estado !== undefined && { estado: updateDto.estado }),
      ...(updateDto.fechaPlanificada !== undefined && {
        fechaPlanificada: updateDto.fechaPlanificada
          ? new Date(updateDto.fechaPlanificada)
          : null,
      }),
      ...(updateDto.periodoId !== undefined && {
        periodoId: updateDto.periodoId,
      }),
    });
  }
}
