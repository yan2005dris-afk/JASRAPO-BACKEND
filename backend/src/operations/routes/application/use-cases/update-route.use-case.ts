import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { UpdateRouteDto } from '../../interfaces/dto/update-route.dto';
import { RouteEntity } from '../../domain/types/route.entity';
import { RouteMapper } from '../../domain/types/mappers';

@Injectable()
export class UpdateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(
    rutaId: bigint,
    updateDto: UpdateRouteDto,
  ): Promise<RouteEntity> {
    const ruta = await this.routeRepository.findUnique({ rutaId });

    if (!ruta || ruta.deletedAt) {
      throw new NotFoundException('Ruta no encontrada');
    }

    const rutaActualizada = await this.routeRepository.update(
      { rutaId },
      {
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
      },
    );

    return RouteMapper.toEntity(rutaActualizada);
  }
}
