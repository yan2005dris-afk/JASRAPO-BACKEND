import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CrearNovedadOperativaDto } from '../dto/create-novedad-operativa.dto';
import { NovedadOperativaEntity } from '../entities/novedad-operativa.entity';

@Injectable()
export class CreateFieldWorkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    createDto: CrearNovedadOperativaDto,
  ): Promise<NovedadOperativaEntity> {
    const novedad = await this.prisma.novedadOperativa.create({
      data: {
        lecturaId: BigInt(createDto.lecturaId),
        observacion: createDto.observacion,
        tipo: createDto.tipo,
        estado: createDto.estado,
      },
    });
    return new NovedadOperativaEntity(novedad);
  }
}
