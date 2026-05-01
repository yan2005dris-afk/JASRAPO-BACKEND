import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ActualizarNovedadOperativaDto } from '../dto/update-novedad-operativa.dto';
import { NovedadOperativaEntity } from '../entities/novedad-operativa.entity';

@Injectable()
export class UpdateFieldWorkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint, updateDto: ActualizarNovedadOperativaDto): Promise<NovedadOperativaEntity> {
    const existing = await this.prisma.novedadOperativa.findUnique({ where: { novedadId: id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Novedad con ID ${id} no encontrada`);
    }

    const dataToUpdate: any = { ...updateDto };
    if (updateDto.lecturaId) dataToUpdate.lecturaId = BigInt(updateDto.lecturaId);

    const novedad = await this.prisma.novedadOperativa.update({
      where: { novedadId: id },
      data: dataToUpdate,
    });
    return new NovedadOperativaEntity(novedad);
  }
}
