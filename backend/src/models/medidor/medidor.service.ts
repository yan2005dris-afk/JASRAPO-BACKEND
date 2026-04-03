import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma, EstadoMedidor, Medidores } from 'src/generated/prisma/client';
import { CrearMedidorDto } from './dto/create-medidor.dto';
import { ActualizarMedidorDto } from './dto/update-medidor.dto';

@Injectable()
export class MedidorService {
  constructor(private readonly prisma: PrismaService) {}

  async crearMedidor(createDto: CrearMedidorDto): Promise<Medidores> {
    return await this.prisma.medidores.create({
      data: { ...createDto, estado: EstadoMedidor.BODEGA },
    });
  }

  async buscarMedidores(params: { skip?: number; take?: number; where?: Prisma.MedidoresWhereInput }): Promise<Medidores[]> {
    return await this.prisma.medidores.findMany({
      ...params,
      where: { ...params.where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buscarMedidor(id: bigint): Promise<Medidores> {
    const medidor = await this.prisma.medidores.findUnique({ where: { medidorId: id } });
    if (!medidor || medidor.deletedAt) throw new NotFoundException(`Medidor con ID ${id} no encontrado`);
    return medidor;
  }

  async actualizarMedidor(id: bigint, updateDto: ActualizarMedidorDto): Promise<Medidores> {
    await this.buscarMedidor(id);
    return await this.prisma.medidores.update({
      where: { medidorId: id },
      data: updateDto,
    });
  }

  async eliminarMedidor(id: bigint): Promise<{ message: string }> {
    await this.buscarMedidor(id);
    await this.prisma.medidores.update({ where: { medidorId: id }, data: { deletedAt: new Date() } });
    return { message: `Medidor con ID ${id} eliminado lógicamente` };
  }

  async instalarMedidor(medidorId: bigint, contratoId: bigint): Promise<Medidores> {
    const medidor = await this.buscarMedidor(medidorId);
    if (medidor.estado !== EstadoMedidor.BODEGA && medidor.estado !== EstadoMedidor.ESTIMADO) {
      throw new BadRequestException(`El medidor no puede ser instalado desde el estado ${medidor.estado}`);
    }

    const [medidorActualizado] = await this.prisma.$transaction([
      this.prisma.medidores.update({
        where: { medidorId },
        data: { estado: EstadoMedidor.INSTALADO },
      }),
      this.prisma.contratoMedidor.create({
        data: { medidorId, contratoId: BigInt(contratoId) },
      }),
    ]);
    return medidorActualizado;
  }

  async reportarDano(medidorId: bigint): Promise<Medidores> {
    const medidor = await this.buscarMedidor(medidorId);
    if (medidor.estado !== EstadoMedidor.INSTALADO) throw new BadRequestException(`Solo medidores INSTALADOS pueden reportarse como dañados`);
    
    return await this.prisma.medidores.update({
      where: { medidorId },
      data: { estado: EstadoMedidor.DANADO },
    });
  }

  async facturarPorPromedio(medidorId: bigint): Promise<Medidores> {
    const medidor = await this.buscarMedidor(medidorId);
    if (medidor.estado !== EstadoMedidor.DANADO) throw new BadRequestException(`Solo medidores DAÑADOS pasan a facturación ESTIMADA`);
    
    return await this.prisma.medidores.update({
      where: { medidorId },
      data: { estado: EstadoMedidor.ESTIMADO },
    });
  }

  async darDeBaja(medidorId: bigint, motivoBaja: string): Promise<Medidores> {
    const medidor = await this.buscarMedidor(medidorId);
    if (medidor.estado !== EstadoMedidor.DANADO) throw new BadRequestException(`Un medidor debe estar DAÑADO antes de darse de baja`);
    
    return await this.prisma.medidores.update({
      where: { medidorId },
      data: { estado: EstadoMedidor.BAJA, fechaBaja: new Date(), motivoBaja },
    });
  }
}