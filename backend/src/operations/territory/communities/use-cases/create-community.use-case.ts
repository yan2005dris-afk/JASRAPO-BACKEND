import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateComunidadDto } from '../dto/create-comunidad.dto';
import { safeCommunitiesSelectWithTimestamps } from '../types/IResponseCommunities';
import { toComunidadResponse } from '../types/communitiesMapper';

@Injectable()
export class CreateCommunityUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateComunidadDto) {
    // Buscar comunidad activa por nombre O código - en un solo llamado
    const existing = await this.prisma.comunidades.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { nombre: { equals: dto.nombre, mode: 'insensitive' } },
          { codigo: dto.codigo },
        ],
      },
    });

    if (existing) {
      if (existing.nombre.toLowerCase() === dto.nombre.toLowerCase()) {
        throw new ConflictException('Ya existe una comunidad con ese nombre');
      }
      throw new ConflictException('Ya existe una comunidad con ese código');
    }

    // Si hay código pero está eliminado -> reaccionar
    const deletedWithCode = await this.prisma.comunidades.findUnique({
      where: { codigo: dto.codigo },
    });

    if (deletedWithCode?.deletedAt) {
      const reactivated = await this.prisma.comunidades.update({
        where: { comunidadId: deletedWithCode.comunidadId },
        data: {
          nombre: dto.nombre,
          porcentajeTasaSeguridad: dto.porcentajeTasaSeguridad,
          deletedAt: null,
        },
        select: safeCommunitiesSelectWithTimestamps,
      });
      return toComunidadResponse(reactivated);
    }

    const created = await this.prisma.comunidades.create({
      data: dto,
      select: safeCommunitiesSelectWithTimestamps,
    });

    return toComunidadResponse(created);
  }
}
