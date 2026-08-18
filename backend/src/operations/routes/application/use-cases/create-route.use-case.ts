import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { CreateRouteDto } from '../../interfaces/dto/create-route.dto';
import { RouteEntity } from '../../domain/entities/route.entity';
import type { CreateRouteData } from '../../domain/types/route.types';
import { TipoRuta } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

/** Route types that target a specific meter work order (not community-periodic). */
const WORK_ORDER_TYPES = new Set<string>([
  TipoRuta.INSTALACION,
  TipoRuta.INSPECCION,
]);

@Injectable()
export class CreateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(createDto: CreateRouteDto): Promise<RouteEntity> {
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

    // Work orders (INSTALACION / INSPECCION) require a medidor
    const isWorkOrder = WORK_ORDER_TYPES.has(createDto.tipoRuta);

    if (isWorkOrder && createDto.medidorId == null) {
      throw new InvalidDomainOperationException(
        'medidorId es obligatorio para rutas de INSTALACION/INSPECCION',
      );
    }

    // Validate medidor when provided
    if (createDto.medidorId != null) {
      const medidor = await this.routeRepository.findMedidor(
        createDto.medidorId,
      );

      if (!medidor) {
        throw new EntityNotFoundException('Medidor', createDto.medidorId);
      }
    }

    // Overlap check applies only to periodic community routes (validating the same month/year planificada)
    if (!isWorkOrder) {
      const fechaPlan = createDto.fechaPlanificada
        ? new Date(createDto.fechaPlanificada)
        : null;

      const overlapping = await this.routeRepository.findOverlappingRoutes(
        createDto.comunidadId,
        createDto.periodoId,
        createDto.sectorId,
        fechaPlan,
        createDto.tipoRuta,
      );

      if (overlapping.length > 0) {
        throw new InvalidDomainOperationException(
          'Ya existe una ruta planificada para esta comunidad en el mismo mes y período',
        );
      }
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
      medidorId: createDto.medidorId,
    };

    const route = await this.routeRepository.create(createData);

    // Si es TOMA_LECTURA periódica, inicializar automáticamente las lecturas PENDIENTES para este mes
    if (createDto.tipoRuta === TipoRuta.TOMA_LECTURA && createDto.fechaPlanificada) {
      await this.routeRepository.initializeMonthlyReadings(
        createDto.comunidadId,
        createDto.periodoId,
        new Date(createDto.fechaPlanificada),
        createDto.sectorId,
        route.rutaId,
      );
    }

    return route;
  }
}
