import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateLecturaDto } from './dto/create-lectura.dto';
import { UpdateLecturaDto } from './dto/update-lectura.dto';
import { LecturaEntity } from './entities/lectura.entity';

const lecturaSelect = {
  lecturaId: true,
  clienteMedidorId: true,
  fecha: true,
  lecturaAnterior: true,
  lecturaActual: true,
  consumoCalculado: true,
  valorMonetario: true,
  abono: true,
  saldoPendiente: true,
  deletedAt: true,
} satisfies Prisma.LecturasSelect;

@Injectable()
export class LecturaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una nueva lectura, luego se debe actualizar el consumoCalculado, valorMonetario, abono y saldoPendiente con base en la lecturaAnterior y lecturaActual
   * para que sean calculados correctamente, esto se puede hacer con un trigger en la base de datos o con lógica adicional en el servicio.
   */
  async create(createLecturaDto: CreateLecturaDto): Promise<LecturaEntity> {
    const lectura = await this.prisma.lecturas.create({
      data: {
        clienteMedidorId: BigInt(createLecturaDto.clienteMedidorId),
        fecha: new Date(createLecturaDto.fecha),
        lecturaAnterior: createLecturaDto.lecturaAnterior,
        lecturaActual: createLecturaDto.lecturaActual,
        consumoCalculado: createLecturaDto.consumoCalculado,
        valorMonetario: createLecturaDto.valorMonetario,
        abono: createLecturaDto.abono,
        saldoPendiente: createLecturaDto.saldoPendiente,
      },
      select: lecturaSelect,
    });

    return new LecturaEntity(lectura);
  }

  /**
   * Todas la lecturas, con paginación opcional y filtros por clienteMedidorId y fecha (rango de fechas)
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturasWhereInput;
    orderBy?: Prisma.LecturasOrderByWithRelationInput;
  }): Promise<LecturaEntity[]> {
    const { skip, take, where, orderBy } = params;

    const lecturas = await this.prisma.lecturas.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy: orderBy || { fecha: 'desc' },
      select: lecturaSelect,
    });

    return lecturas.map((lectura) => new LecturaEntity(lectura));
  }

  /**
   * Obtiene una lectura por ID, si no existe o está eliminada (deletedAt no es null) lanza una excepción NotFoundException
   */
  async findOne(id: bigint): Promise<LecturaEntity> {
    const lectura = await this.prisma.lecturas.findUnique({
      where: { lecturaId: id },
      select: lecturaSelect,
    });

    if (!lectura || lectura.deletedAt) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    return new LecturaEntity(lectura);
  }

  /**
   * Actualiza una lectura por ID, si no existe o está eliminada (deletedAt no es null) lanza una excepción NotFoundException
   */
  async update(
    id: bigint,
    updateLecturaDto: UpdateLecturaDto,
  ): Promise<LecturaEntity> {
    const lecturaExistente = await this.prisma.lecturas.findUnique({
      where: { lecturaId: id },
    });

    if (!lecturaExistente || lecturaExistente.deletedAt) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    const lectura = await this.prisma.lecturas.update({
      where: { lecturaId: id },
      data: updateLecturaDto,
      select: lecturaSelect,
    });

    return new LecturaEntity(lectura);
  }

  /**
   * Elimina una lectura (soft delete), si no existe o ya está eliminada (deletedAt no es null) lanza una excepción NotFoundException
   */
  async remove(id: bigint): Promise<{ message: string }> {
    const lectura = await this.prisma.lecturas.findUnique({
      where: { lecturaId: id },
    });

    if (!lectura || lectura.deletedAt) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    await this.prisma.lecturas.update({
      where: { lecturaId: id },
      data: { deletedAt: new Date() },
    });

    return { message: `Lectura con ID ${id} eliminada correctamente` };
  }
}
