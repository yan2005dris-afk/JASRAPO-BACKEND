import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
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

    // Rol operador = 5
    if (operario.rol?.rolId !== 5) {
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

    const lecturasExistentes = await this.prisma.lecturas.findMany({
      where: {
        lecturaId: { in: lecturaIds },
        estadoAsignacion: 'NO_ASIGNADA',
        estado: {
          in: ['PENDIENTE', 'POR_REVISION'],
        },
        deletedAt: null,
      },
      include: {
        contrato: true,
      },
    });

    // Validar que todas existan
    if (lecturasExistentes.length !== lecturaIds.length) {
      throw new BadRequestException(
        'Una o más lecturas no están disponibles para asignar',
      );
    }

    // Validar contratos activos
    const contratosInvalidos = lecturasExistentes.some(
      (lectura) => !lectura.contrato || lectura.contrato.estado !== 'ACTIVO',
    );

    if (contratosInvalidos) {
      throw new BadRequestException(
        'Una o más lecturas pertenecen a contratos no activos',
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

      // Asignar lecturas
      await tx.lecturas.updateMany({
        where: {
          lecturaId: { in: lecturaIds },
        },
        data: {
          rutaAsignadaId: rutaCreada.rutaId,
          estadoAsignacion: 'ASIGNADA',
        },
      });

      return rutaCreada;
    });

    return RouteMapper.toEntity(ruta);
  }
}
