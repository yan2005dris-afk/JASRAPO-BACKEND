import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { CreateRouteDto } from '../../interfaces/dto/create-route.dto';
import { RouteEntity } from '../../domain/entities/route.entity';
import { RouteMapper } from '../../infrastructure/mappers/route.mapper';
import type { CreateRouteData } from '../../domain/types/create-route-data';

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

    const periodo = await this.routeRepository.findPeriodo({
      periodoId: createDto.periodoId,
    });

    if (!periodo) {
      throw new NotFoundException('Periodo no encontrado');
    }

    if (periodo.estado !== 'ABIERTO') {
      throw new BadRequestException('El periodo no está abierto');
    }

    const overlapping = await this.routeRepository.findOverlappingRoutes(
      createDto.comunidadId,
      createDto.periodoId,
      createDto.sectorId,
    );

    if (overlapping.length > 0) {
      throw new BadRequestException(
        'Ya existe una ruta para esta comunidad y periodo',
      );
    }

    const createData: CreateRouteData = {
      nombre: createDto.nombre,
      descripcion: createDto.descripcion,
      operarioId: createDto.operarioId,
      tipoRuta: createDto.tipoRuta,
      comunidadId: createDto.comunidadId,
      sectorId: createDto.sectorId,
      periodoId: createDto.periodoId,
      fechaPlanificada: createDto.fechaPlanificada
        ? new Date(createDto.fechaPlanificada)
        : null,
      estado: 'PENDIENTE',
    };

    const ruta = await this.routeRepository.create(createData);

    return RouteMapper.toEntity(ruta);
  }
}
