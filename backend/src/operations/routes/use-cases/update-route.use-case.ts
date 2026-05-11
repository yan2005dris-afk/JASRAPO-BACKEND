import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { RouteEntity } from '../types/route.entity';
import { RouteMapper } from '../types/mappers';
import { EstadoRuta } from 'src/generated/prisma/client';

@Injectable()
export class UpdateRouteUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    rutaId: bigint,
    updateDto: UpdateRouteDto,
  ): Promise<RouteEntity> {
    const ruta = await this.prisma.rutas.findUnique({
      where: { rutaId },
    });

    if (!ruta || ruta.deletedAt) {
      throw new NotFoundException('Ruta no encontrada');
    }

    const rutaActualizada = await this.prisma.rutas.update({
      where: { rutaId },
      data: {
        ...(updateDto.nombre !== undefined && { nombre: updateDto.nombre }),
        ...(updateDto.descripcion !== undefined && {
          descripcion: updateDto.descripcion,
        }),
        ...(updateDto.estado !== undefined && {
          estado: updateDto.estado as EstadoRuta,
        }),
        ...(updateDto.fechaPlanificada !== undefined && {
          fechaPlanificada: updateDto.fechaPlanificada
            ? new Date(updateDto.fechaPlanificada)
            : null,
        }),
      },
    });

    return RouteMapper.toEntity(rutaActualizada);
  }
}
