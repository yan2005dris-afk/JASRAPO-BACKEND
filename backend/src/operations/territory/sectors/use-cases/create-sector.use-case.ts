import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateSectorDto } from '../dto/create-sector.dto';
import { safeSectoresSelect } from '../types/IResponseSector';

@Injectable()
export class CreateSectorUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateSectorDto) {
    const comunidad = await this.prisma.comunidades.findUnique({
      where: { comunidadId: dto.comunidadId },
    });

    if (!comunidad) {
      throw new NotFoundException('La comunidad especificada no existe.');
    }

    try {
      const newSector = await this.prisma.sectores.create({
        data: dto,
        select: safeSectoresSelect,
      });

      return {
        message: 'Sector creado exitosamente.',
        statusCode: 201,
        data: newSector,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'El sector ya existe (código o ID duplicado).',
        );
      }
      throw error;
    }
  }
}
