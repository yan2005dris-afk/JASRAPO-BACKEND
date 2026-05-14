import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoGenerico, Prisma } from 'src/generated/prisma/client';
import { CreateRouteDto } from '../dto/create-route.dto';
import { RouteEntity } from '../types/route.entity';
import { RouteMapper } from '../types/mappers';

@Injectable()
export class CreateRouteUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createDto: CreateRouteDto): Promise<RouteEntity> {
    // 1. Validar operario
    const operario = await this.prisma.usuarios.findUnique({
      where: { usuarioId: createDto.operarioId },
      include: { rol: true },
    });

    if (!operario) {
      throw new NotFoundException('Operario no encontrado');
    }

    // Rol operador = 'operadores'
    if (operario.rol?.nombre !== 'operadores') {
      throw new BadRequestException('Solo se pueden asignar operadores');
    }

    // 2. Validar comunidad
    const comunidad = await this.prisma.comunidades.findUnique({
      where: { comunidadId: createDto.comunidadId },
    });

    if (!comunidad) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    // 3. Validar sector
    if (createDto.sectorId) {
      const sector = await this.prisma.sectores.findUnique({
        where: { sectorId: createDto.sectorId },
      });

      if (!sector) {
        throw new NotFoundException('Sector no encontrado');
      }

      if (sector.comunidadId !== createDto.comunidadId) {
        throw new BadRequestException('El sector no pertenece a la comunidad');
      }
    }

    // 4. Validar lecturas
    const lecturaIds = createDto.lecturaIds.map((id) => BigInt(id));

    const estadoContratoEsperado =
      createDto.tipoRuta === 'TOMA_LECTURA'
        ? EstadoGenerico.ACTIVO
        : EstadoGenerico.RECONEXION;

    const lecturasExistentes = await this.prisma.lecturas.findMany({
      where: {
        lecturaId: { in: lecturaIds },
        estadoAsignacion: 'NO_ASIGNADA',
        estado: {
          in: ['PENDIENTE', 'POR_REVISION'],
        },
        deletedAt: null,
        contrato: {
          estado: estadoContratoEsperado,
          comunidadId: createDto.comunidadId,
          ...(createDto.sectorId && { sectorId: createDto.sectorId }),
          deletedAt: null,
        },
      },
      include: {
        contrato: true,
      },
    });

    // Validar que todas existan
    if (lecturasExistentes.length !== lecturaIds.length) {
      throw new BadRequestException(
        'Una o más lecturas no están disponibles para asignar, pertenecen a otra comunidad/sector, o su contrato no tiene el estado requerido',
      );
    }

    // Validar contratos (respaldo por si Prisma devuelve sin contrato)
    const contratosInvalidos = lecturasExistentes.some(
      (lectura) =>
        !lectura.contrato || lectura.contrato.estado !== estadoContratoEsperado,
    );

    if (contratosInvalidos) {
      throw new BadRequestException(
        `Una o más lecturas pertenecen a contratos que no están en estado ${estadoContratoEsperado}`,
      );
    }

    // 5. Crear ruta
    const ruta = await this.prisma.$transaction(async (tx) => {
      const rutaCreada = await tx.rutas.create({
        data: {
          nombre: createDto.nombre,
          descripcion: createDto.descripcion,
          operarioId: createDto.operarioId,
          tipoRuta: createDto.tipoRuta,
          comunidadId: createDto.comunidadId,
          sectorId: createDto.sectorId,
          fechaPlanificada: createDto.fechaPlanificada
            ? new Date(createDto.fechaPlanificada)
            : null,
          estado: 'PENDIENTE',
        },
      });

      const lecturasDisponiblesWhere: Prisma.LecturasWhereInput = {
        lecturaId: { in: lecturaIds },
        estadoAsignacion: 'NO_ASIGNADA',
        estado: {
          in: ['PENDIENTE', 'POR_REVISION'],
        },
        deletedAt: null,
        contrato: {
          estado: estadoContratoEsperado,
          comunidadId: createDto.comunidadId,
          ...(createDto.sectorId ? { sectorId: createDto.sectorId } : {}),
          deletedAt: null,
        },
      };

      const lecturasDisponibles = await tx.lecturas.count({
        where: lecturasDisponiblesWhere,
      });

      if (lecturasDisponibles !== lecturaIds.length) {
        throw new BadRequestException(
          'Una o más lecturas ya no cumplen las condiciones requeridas para ser asignadas',
        );
      }

      // Asignar lecturas
      const updateResult = await tx.lecturas.updateMany({
        where: {
          lecturaId: { in: lecturaIds },
          estadoAsignacion: 'NO_ASIGNADA',
          estado: {
            in: ['PENDIENTE', 'POR_REVISION'],
          },
          deletedAt: null,
        },
        data: {
          rutaAsignadaId: rutaCreada.rutaId,
          estadoAsignacion: 'ASIGNADA',
        },
      });

      if (updateResult.count !== lecturaIds.length) {
        throw new BadRequestException(
          'Una o más lecturas ya fueron asignadas o no están disponibles (condición de carrera)',
        );
      }

      return rutaCreada;
    });

    return RouteMapper.toEntity(ruta);
  }
}
