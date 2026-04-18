import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CrearLecturaDto } from './dto/create-lectura.dto';
import { ActualizarLecturaDto } from './dto/update-lectura.dto';
import { LecturaEntity } from './entities/lectura.entity';

const lecturaSelect = {
  lecturaId: true,
  fecha: true,
  lecturaAnterior: true,
  lecturaActual: true,
  consumoCalculado: true,
  contratoId: true,
  createdAt: true,
  descripcionAnomalia: true,
  fechaValidacion: true,
  fotoUrlMinIo: true,
  isValidada: true,
  lecturaInicial: true,
  periodo: true,
  tieneAnomalia: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.LecturasSelect;

@Injectable()
export class LecturaService {
  constructor(private prisma: PrismaService) {}

  async crearLectura(createDto: CrearLecturaDto): Promise<LecturaEntity> {
    const lectura = await this.prisma.lecturas.create({
      data: {
        fecha: new Date(createDto.fecha),
        lecturaAnterior: createDto.lecturaAnterior,
        lecturaActual: createDto.lecturaActual,
        consumoCalculado: createDto.consumoCalculado ?? 0,
        contratoId: BigInt(createDto.contratoId),
        descripcionAnomalia: createDto.descripcionAnomalia,
        fotoUrlMinIo: createDto.fotoUrlMinIo,
        isValidada: createDto.isValidada ?? false,
        lecturaInicial: createDto.lecturaInicial,
        periodo: createDto.periodo,
        tieneAnomalia: createDto.tieneAnomalia ?? false,
      },
      select: lecturaSelect,
    });
    return new LecturaEntity(lectura);
  }

  async buscarLecturas(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturasWhereInput;
  }): Promise<LecturaEntity[]> {
    const { skip, take, where } = params;
    const lecturas = await this.prisma.lecturas.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy: { fecha: 'desc' },
      select: lecturaSelect,
    });
    return lecturas.map((l) => new LecturaEntity(l));
  }

  async buscarLectura(id: bigint): Promise<LecturaEntity> {
    const lectura = await this.prisma.lecturas.findUnique({
      where: { lecturaId: id },
      select: lecturaSelect,
    });
    if (!lectura || lectura.deletedAt)
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    return new LecturaEntity(lectura);
  }

  async actualizarLectura(
    id: bigint,
    updateDto: ActualizarLecturaDto,
  ): Promise<LecturaEntity> {
    await this.buscarLectura(id);

    const dataToUpdate: any = { ...updateDto };
    if (updateDto.contratoId)
      dataToUpdate.contratoId = BigInt(updateDto.contratoId);
    if (updateDto.fecha) dataToUpdate.fecha = new Date(updateDto.fecha);

    const lectura = await this.prisma.lecturas.update({
      where: { lecturaId: id },
      data: dataToUpdate,
      select: lecturaSelect,
    });
    return new LecturaEntity(lectura);
  }

  async eliminarLectura(id: bigint): Promise<{ message: string }> {
    await this.buscarLectura(id);
    await this.prisma.lecturas.update({
      where: { lecturaId: id },
      data: { deletedAt: new Date() },
    });
    return { message: `Lectura con ID ${id} eliminada` };
  }
}
