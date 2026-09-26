import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { CreateRouteDto } from '../../interfaces/dto/create-route.dto';
import { RouteEntity } from '../../domain/entities/route.entity';
import type { CreateRouteData } from '../../domain/types/route.types';
import { TipoActividadCodes } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { DateUtil } from 'src/shared/utils/date.util';

/** Route types that target a specific meter work order (not community-periodic). */
const WORK_ORDER_TYPES = new Set<string>([
  TipoActividadCodes.INSTALACION,
  TipoActividadCodes.INSPECCION,
]);

@Injectable()
export class CreateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(createDto: CreateRouteDto): Promise<RouteEntity> {
    // operarioId es opcional: las rutas INSTALACION se crean sin operario
    // y se despachan después desde la bandeja de secretaría (SC-174).
    if (createDto.operarioId !== undefined && createDto.operarioId !== null) {
      const operario = await this.routeRepository.findUsuario(
        createDto.operarioId,
        { includeRole: true },
      );

      if (!operario) {
        throw new EntityNotFoundException('Operario', createDto.operarioId);
      }

      if (operario.rol?.nombre !== 'operadores') {
        throw new InvalidDomainOperationException(
          'Solo se pueden asignar operadores',
        );
      }
    }

    const comunidad = await this.routeRepository.findComunidad(
      createDto.comunidadId,
    );

    if (!comunidad) {
      throw new EntityNotFoundException('Comunidad', createDto.comunidadId);
    }

    if (createDto.sectorId) {
      const sector = await this.routeRepository.findSector(createDto.sectorId);

      if (!sector) {
        throw new EntityNotFoundException('Sector', createDto.sectorId);
      }

      if (sector.comunidadId !== createDto.comunidadId) {
        throw new InvalidDomainOperationException(
          'El sector no pertenece a la comunidad',
        );
      }
    }

    const periodo = await this.routeRepository.findPeriodo(createDto.periodoId);

    if (!periodo) {
      throw new EntityNotFoundException('Periodo', createDto.periodoId);
    }

    if (periodo.estado !== 'ABIERTO') {
      throw new InvalidDomainOperationException('El periodo no está abierto');
    }

    const isWorkOrder = WORK_ORDER_TYPES.has(createDto.tipoRuta);

    // Overlap check applies only to periodic community routes (validating the same period)
    if (!isWorkOrder) {
      const overlapping = await this.routeRepository.findOverlappingRoutes(
        createDto.comunidadId,
        createDto.periodoId,
        createDto.sectorId,
        createDto.tipoRuta,
      );

      if (overlapping.length > 0) {
        throw new InvalidDomainOperationException(
          'Ya existe una ruta planificada para esta comunidad en este periodo',
        );
      }
    }

    const createData: CreateRouteData = {
      nombre: createDto.nombre,
      descripcion: createDto.descripcion,
      operarioId: createDto.operarioId ?? null,
      tipoRuta: createDto.tipoRuta,
      comunidadId: createDto.comunidadId,
      sectorId: createDto.sectorId,
      periodoId: createDto.periodoId,
      fechaPlanificada: DateUtil.parseFrontendDate(
        createDto.fechaPlanificada ?? null,
      ),
      estado: 'PENDIENTE',
    };

    const route = await this.routeRepository.create(createData);

    // Si es LECTURA periódica, inicializar automáticamente las lecturas PENDIENTES para este mes
    if (
      createDto.tipoRuta === TipoActividadCodes.LECTURA &&
      createDto.fechaPlanificada
    ) {
      await this.routeRepository.initializeMonthlyReadings(
        createDto.comunidadId,
        createDto.periodoId,
        DateUtil.parseFrontendDateStrict(createDto.fechaPlanificada),
        createDto.sectorId,
        route.rutaId,
      );
    }

    return route;
  }
}
