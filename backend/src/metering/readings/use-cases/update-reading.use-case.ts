import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ActualizarLecturaDto } from '../dto/update-lectura.dto';
import { safeReadingsSelect } from '../types/IResponseReading';
import { toReadingResponse } from '../types/readingMapper';

@Injectable()
export class UpdateReadingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: bigint,
    updateDto: ActualizarLecturaDto,
  ) {
    const existing = await this.prisma.lecturas.findFirst({
      where: { lecturaId: id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    const dataToUpdate: any = { ...updateDto };
    if (updateDto.contratoId)
      dataToUpdate.contratoId = BigInt(updateDto.contratoId);
    if (updateDto.fecha) dataToUpdate.fecha = new Date(updateDto.fecha);

    const lectura = await this.prisma.lecturas.update({
      where: { lecturaId: id },
      data: dataToUpdate,
      select: safeReadingsSelect,
    });
    return toReadingResponse(lectura);
  }
}
