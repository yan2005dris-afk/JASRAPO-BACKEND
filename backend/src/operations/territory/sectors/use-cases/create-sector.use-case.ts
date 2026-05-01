import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateSectorDto } from '../dto/create-sector.dto';

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
      await this.prisma.sectores.create({
        data: dto,
      });

      return {
        message: 'Sector creado exitosamente.',
        statusCode: 201,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('El sector ya existe (código o ID duplicado).');
      }
      throw error;
    }
  }
}
