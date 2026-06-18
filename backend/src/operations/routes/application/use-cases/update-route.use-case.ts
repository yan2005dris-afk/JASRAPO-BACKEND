import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { UpdateRouteDto } from '../../interfaces/dto/update-route.dto';
import { RouteEntity } from '../../domain/entities/route.entity';
import { RouteMapper } from '../../infrastructure/mappers/route.mapper';

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

    if (updateDto.periodoId !== undefined) {
      const periodo = await this.routeRepository.findPeriodo({
        periodoId: updateDto.periodoId,
      });

      if (!periodo) {
        throw new NotFoundException('Periodo no encontrado');
      }

      if (periodo.estado !== 'ABIERTO') {
        throw new BadRequestException('El periodo no está abierto');
      }

      const overlapping = await this.routeRepository.findOverlappingRoutes(
        ruta.comunidadId,
        updateDto.periodoId,
        ruta.sectorId,
      );

      if (overlapping.some((r: any) => r.rutaId !== rutaId)) {
        throw new BadRequestException(
          'Ya existe una ruta para esta comunidad y periodo',
        );
      }
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
        ...(updateDto.periodoId !== undefined && {
          periodoId: updateDto.periodoId,
        }),
      },
    );

    return RouteMapper.toEntity(rutaActualizada);
  }
}
