import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { CreateRouteDto } from '../../interfaces/dto/create-route.dto';
import { RouteEntity } from '../../domain/types/route.entity';
import { RouteMapper } from '../../domain/types/mappers';

@Injectable()
export class CreateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(createDto: CreateRouteDto): Promise<RouteEntity> {
    const operario = await this.routeRepository.findUsuario(
      { usuarioId: createDto.operarioId },
      { include: { rol: true } },
    );

    if (!operario) {
      throw new NotFoundException('Operario no encontrado');
    }

    if (operario.rol?.nombre !== 'operadores') {
      throw new BadRequestException('Solo se pueden asignar operadores');
    }

    const comunidad = await this.routeRepository.findComunidad({
      comunidadId: createDto.comunidadId,
    });

    if (!comunidad) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    if (createDto.sectorId) {
      const sector = await this.routeRepository.findSector({
        sectorId: createDto.sectorId,
      });

      if (!sector) {
        throw new NotFoundException('Sector no encontrado');
      }

      if (sector.comunidadId !== createDto.comunidadId) {
        throw new BadRequestException('El sector no pertenece a la comunidad');
      }
    }

  const ruta = await this.routeRepository.create({
    nombre: createDto.nombre,
    descripcion: createDto.descripcion,
    operario: {
      connect: {
        usuarioId: createDto.operarioId,
      },
    },
    tipoRuta: createDto.tipoRuta,
    comunidad: {
      connect: {
        comunidadId: createDto.comunidadId,
      },
    },
    sector: createDto.sectorId ? { connect: { sectorId: createDto.sectorId } } : undefined,
    fechaPlanificada: createDto.fechaPlanificada ? new Date(createDto.fechaPlanificada) : null,
    estado: 'PENDIENTE',
  });

    return RouteMapper.toEntity(ruta);
  }
}
