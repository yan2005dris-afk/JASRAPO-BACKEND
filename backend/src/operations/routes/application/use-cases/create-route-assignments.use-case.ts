import { Injectable } from '@nestjs/common';
import {
  RouteRepository,
  type SectorRef,
} from '../../domain/repositories/route.repository';
import { CreateRouteAssignmentsDto } from '../../interfaces/dto/create-route-assignments.dto';
import type { RouteRow } from '../../infrastructure/repositories/route.include';
import type { CreateRouteData } from '../../domain/types/route.types';
import { TipoActividadCodes } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class CreateRouteAssignmentsUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(dto: CreateRouteAssignmentsDto): Promise<RouteRow[]> {
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

    const fechaLectura = periodo.fechaInicio
      ? new Date(periodo.fechaInicio)
      : new Date();

    const tipoRuta = dto.tipoRuta ?? TipoActividadCodes.LECTURA;

    // Caso 1: Si se especificaron contratos específicos (Cortes, Reconexiones, Inspecciones, etc.)
    if (dto.contratoIds && dto.contratoIds.length > 0) {
      const baseName = dto.nombreBase?.trim() || 'Ruta';
      const sectorId =
        dto.sectorIds && dto.sectorIds.length === 1
          ? dto.sectorIds[0]
          : undefined;

      const contratosRef = await this.routeRepository.findContratosByIds(
        dto.contratoIds,
      );
      let suffix = `Comunidad ${comunidad.nombre ?? dto.comunidadId}`;
      if (contratosRef.length === 1) {
        suffix = `Contrato ${contratosRef[0].numeroGuia || contratosRef[0].contratoId}`;
      } else if (contratosRef.length > 1) {
        const firstGuias = contratosRef
          .slice(0, 2)
          .map((c) => c.numeroGuia || c.contratoId)
          .join(', ');
        const extraCount = contratosRef.length - 2;
        suffix =
          extraCount > 0
            ? `Contratos ${firstGuias} (+${extraCount})`
            : `Contratos ${firstGuias}`;
      }

      const routeName = `${baseName} - ${suffix}`.slice(0, 200);

      const createData: CreateRouteData = {
        nombre: routeName,
        operarioId: dto.operarioId,
        tipoRuta,
        comunidadId: dto.comunidadId,
        sectorId,
        periodoId: dto.periodoId,
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
      const uniqueSectorIds = Array.from(new Set(dto.sectorIds));
      const validatedSectors: SectorRef[] = [];
      for (const sectorId of uniqueSectorIds) {
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
          tipoRuta,
        );

        if (overlapping.length > 0) {
          throw new InvalidDomainOperationException(
            `Ya existe una ruta planificada para el sector ${sector.nombre ?? sectorId} en este periodo`,
          );
        }

        validatedSectors.push(sector);
      }

      const createdRoutes: RouteRow[] = [];
      for (const sector of validatedSectors) {
        const baseName = dto.nombreBase?.trim() || 'Ruta';
        const sectorLabel = sector.nombre
          ? sector.nombre
          : `Sector ${sector.sectorId}`;
        const routeName = `${baseName} - ${sectorLabel}`.slice(0, 200);

        const createData: CreateRouteData = {
          nombre: routeName,
          operarioId: dto.operarioId,
          tipoRuta,
          comunidadId: dto.comunidadId,
          sectorId: sector.sectorId,
          periodoId: dto.periodoId,
          estado: 'PENDIENTE',
        };

        const route = await this.routeRepository.create(createData);

        if (tipoRuta === TipoActividadCodes.LECTURA) {
          await this.routeRepository.initializeMonthlyReadings(
            dto.comunidadId,
            dto.periodoId,
            fechaLectura,
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
      tipoRuta,
    );

    if (overlapping.length > 0) {
      throw new InvalidDomainOperationException(
        'Ya existe una ruta planificada para esta comunidad en este periodo',
      );
    }

    const baseName = dto.nombreBase?.trim() || 'Ruta';
    const routeName = `${baseName} - Comunidad ${dto.comunidadId}`.slice(
      0,
      200,
    );

    const createData: CreateRouteData = {
      nombre: routeName,
      operarioId: dto.operarioId,
      tipoRuta,
      comunidadId: dto.comunidadId,
      sectorId: undefined,
      periodoId: dto.periodoId,
      estado: 'PENDIENTE',
    };

    const route = await this.routeRepository.create(createData);

    if (tipoRuta === TipoActividadCodes.LECTURA) {
      await this.routeRepository.initializeMonthlyReadings(
        dto.comunidadId,
        dto.periodoId,
        fechaLectura,
        null,
        route.rutaId,
      );
    }

    return [route];
  }
}
