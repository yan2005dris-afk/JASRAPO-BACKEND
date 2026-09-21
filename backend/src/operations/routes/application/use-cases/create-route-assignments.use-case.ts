import { Injectable } from '@nestjs/common';
import {
  RouteRepository,
  type SectorRef,
} from '../../domain/repositories/route.repository';
import { CreateRouteAssignmentsDto } from '../../interfaces/dto/create-route-assignments.dto';
import { RouteEntity } from '../../domain/entities/route.entity';
import type { CreateRouteData } from '../../domain/types/route.types';
import { TipoActividadCodes } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { DateUtil } from 'src/shared/utils/date.util';

@Injectable()
export class CreateRouteAssignmentsUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(dto: CreateRouteAssignmentsDto): Promise<RouteEntity[]> {
    const operario = await this.routeRepository.findUsuario(dto.operarioId, {
      includeRole: true,
    });

    if (!operario) {
      throw new EntityNotFoundException('Operario', dto.operarioId);
    }

    if (operario.rol?.nombre !== 'operadores') {
      throw new InvalidDomainOperationException(
        'Solo se pueden asignar operadores',
      );
    }

    const comunidad = await this.routeRepository.findComunidad(dto.comunidadId);
    if (!comunidad) {
      throw new EntityNotFoundException('Comunidad', dto.comunidadId);
    }

    const periodo = await this.routeRepository.findPeriodo(dto.periodoId);
    if (!periodo) {
      throw new EntityNotFoundException('Periodo', dto.periodoId);
    }

    if (periodo.estado !== 'ABIERTO') {
      throw new InvalidDomainOperationException('El periodo no está abierto');
    }

    const fechaPlanificada = DateUtil.parseFrontendDate(
      dto.fechaPlanificada ?? null,
    );

    const rawSectorIds = dto.sectorIds ?? [];
    const uniqueSectorIds = Array.from(new Set(rawSectorIds));

    const tipoRuta = dto.tipoRuta ?? TipoActividadCodes.LECTURA;

    // Caso 1: Si se especificaron contratos específicos (Cortes, Reconexiones, Inspecciones, etc.)
    if (dto.contratoIds && dto.contratoIds.length > 0) {
      const baseName = dto.nombreBase?.trim() || 'Ruta';
      const sectorId =
        dto.sectorIds && dto.sectorIds.length === 1 ? dto.sectorIds[0] : undefined;
      const routeName = `${baseName} - Comunidad ${dto.comunidadId}`.slice(0, 200);

      const createData: CreateRouteData = {
        nombre: routeName,
        operarioId: dto.operarioId,
        tipoRuta,
        comunidadId: dto.comunidadId,
        sectorId,
        periodoId: dto.periodoId,
        fechaPlanificada,
        estado: 'PENDIENTE',
      };

      const route = await this.routeRepository.create(createData);
      await this.routeRepository.createWorkOrdersForContracts(
        route.rutaId,
        dto.contratoIds,
      );

      return [route];
    }

    // Caso 2: Si se especificaron sectores => Crear una ruta por cada sector (Lecturas masivas)
    if (dto.sectorIds && dto.sectorIds.length > 0) {
      const validatedSectors = [];
      for (const sectorId of dto.sectorIds) {
        const sector = await this.routeRepository.findSector(sectorId);
        if (!sector) {
          throw new EntityNotFoundException('Sector', sectorId);
        }
        if (sector.comunidadId !== dto.comunidadId) {
          throw new InvalidDomainOperationException(
            `El sector ${sectorId} no pertenece a la comunidad ${dto.comunidadId}`,
          );
        }

        const overlapping = await this.routeRepository.findOverlappingRoutes(
          dto.comunidadId,
          dto.periodoId,
          sectorId,
          fechaPlanificada,
          tipoRuta,
        );

        if (overlapping.length > 0) {
          throw new InvalidDomainOperationException(
            `Ya existe una ruta planificada para el sector ${sector.nombre ?? sectorId} en este periodo`,
          );
        }

        validatedSectors.push(sector);
      }

      const createdRoutes: RouteEntity[] = [];
      for (const sector of validatedSectors) {
        const baseName = dto.nombreBase?.trim() || 'Ruta';
        const sectorLabel = sector.nombre ? sector.nombre : `Sector ${sector.sectorId}`;
        const routeName = `${baseName} - ${sectorLabel}`.slice(0, 200);

        const createData: CreateRouteData = {
          nombre: routeName,
          operarioId: dto.operarioId,
          tipoRuta,
          comunidadId: dto.comunidadId,
          sectorId: sector.sectorId,
          periodoId: dto.periodoId,
          fechaPlanificada,
          estado: 'PENDIENTE',
        };

        const route = await this.routeRepository.create(createData);

        if (tipoRuta === TipoActividadCodes.LECTURA && dto.fechaPlanificada) {
          await this.routeRepository.initializeMonthlyReadings(
            dto.comunidadId,
            dto.periodoId,
            DateUtil.parseFrontendDateStrict(dto.fechaPlanificada),
            sector.sectorId,
            route.rutaId,
          );
        }

        createdRoutes.push(route);
      }

      return createdRoutes;
    }

    // Si NO se especificaron sectores => Toda la comunidad
    const overlapping = await this.routeRepository.findOverlappingRoutes(
      dto.comunidadId,
      dto.periodoId,
      undefined,
      fechaPlanificada,
      tipoRuta,
    );

    if (overlapping.length > 0) {
      throw new InvalidDomainOperationException(
        'Ya existe una ruta planificada para esta comunidad en el mismo mes y período',
      );
    }

    const baseName = dto.nombreBase?.trim() || 'Ruta';
    const routeName = `${baseName} - Comunidad ${dto.comunidadId}`.slice(0, 200);

    const createData: CreateRouteData = {
      nombre: routeName,
      operarioId: dto.operarioId,
      tipoRuta,
      comunidadId: dto.comunidadId,
      sectorId: undefined,
      periodoId: dto.periodoId,
      fechaPlanificada,
      estado: 'PENDIENTE',
    };

    const route = await this.routeRepository.create(createData);

    if (tipoRuta === TipoActividadCodes.LECTURA && dto.fechaPlanificada) {
      await this.routeRepository.initializeMonthlyReadings(
        dto.comunidadId,
        dto.periodoId,
        DateUtil.parseFrontendDateStrict(dto.fechaPlanificada),
        null,
        route.rutaId,
      );
    }

    return [route];
  }
}
