import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CrearNovedadOperativaDto } from './dto/create-novedad-operativa.dto';
import { ActualizarNovedadOperativaDto } from './dto/update-novedad-operativa.dto';
import { NovedadOperativaEntity } from './entities/novedad-operativa.entity';

const novedadSelect = {
  novedadId: true,
  lecturaId: true,
  observacion: true,
  tipo: true,
  estado: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.NovedadOperativaSelect;

@Injectable()
export class NovedadOperativaService {
  constructor(private readonly prisma: PrismaService) {}

  async crearNovedadOperativa(
    createDto: CrearNovedadOperativaDto,
  ): Promise<NovedadOperativaEntity> {
    const novedad = await this.prisma.novedadOperativa.create({
      data: {
        lecturaId: BigInt(createDto.lecturaId),
        observacion: createDto.observacion,
        tipo: createDto.tipo,
        estado: createDto.estado,
      },
      select: novedadSelect,
    });
    return new NovedadOperativaEntity(novedad);
  }

  async buscarNovedades(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NovedadOperativaWhereInput;
  }): Promise<NovedadOperativaEntity[]> {
    const { skip, take, where } = params;
    const novedades = await this.prisma.novedadOperativa.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: novedadSelect,
    });
    return novedades.map((n) => new NovedadOperativaEntity(n));
  }

  async buscarNovedad(id: bigint): Promise<NovedadOperativaEntity> {
    const novedad = await this.prisma.novedadOperativa.findUnique({
      where: { novedadId: id },
      select: novedadSelect,
    });
    if (!novedad || novedad.deletedAt)
      throw new NotFoundException(`Novedad con ID ${id} no encontrada`);
    return new NovedadOperativaEntity(novedad);
  }

  async actualizarNovedad(
    id: bigint,
    updateDto: ActualizarNovedadOperativaDto,
  ): Promise<NovedadOperativaEntity> {
    await this.buscarNovedad(id);
    const dataToUpdate: any = { ...updateDto };
    if (updateDto.lecturaId)
      dataToUpdate.lecturaId = BigInt(updateDto.lecturaId);

    const novedad = await this.prisma.novedadOperativa.update({
      where: { novedadId: id },
      data: dataToUpdate,
      select: novedadSelect,
    });
    return new NovedadOperativaEntity(novedad);
  }

  async eliminarNovedad(id: bigint): Promise<{ message: string }> {
    await this.buscarNovedad(id);
    await this.prisma.novedadOperativa.update({
      where: { novedadId: id },
      data: { deletedAt: new Date() },
    });
    return { message: `Novedad Operativa con ID ${id} eliminada` };
  }
}
