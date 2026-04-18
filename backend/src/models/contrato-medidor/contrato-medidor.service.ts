import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma, ContratoMedidor } from 'src/generated/prisma/client';
import { CrearContratoMedidorDto } from './dto/create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from './dto/update-contrato-medidor.dto';

@Injectable()
export class ContratoMedidorService {
  constructor(private readonly prisma: PrismaService) {}

  async crearContrato(
    createDto: CrearContratoMedidorDto,
  ): Promise<ContratoMedidor> {
    return await this.prisma.contratoMedidor.create({
      data: {
        contratoId: BigInt(createDto.contratoId),
        medidorId: BigInt(createDto.medidorId),
        fechaInicio: createDto.fechaInicio || new Date(),
        motivoCambio: createDto.motivoCambio,
      },
    });
  }

  async buscarContratos(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ContratoMedidorWhereInput;
  }): Promise<ContratoMedidor[]> {
    return await this.prisma.contratoMedidor.findMany({
      ...params,
      where: { ...params.where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buscarContrato(id: bigint): Promise<ContratoMedidor> {
    const registro = await this.prisma.contratoMedidor.findUnique({
      where: { contratoMedidorId: id },
    });
    if (!registro || registro.deletedAt)
      throw new NotFoundException(`Registro con ID ${id} no encontrado`);
    return registro;
  }

  async actualizar(
    id: bigint,
    updateDto: ActualizarContratoMedidorDto,
  ): Promise<ContratoMedidor> {
    await this.buscarContrato(id);
    return await this.prisma.contratoMedidor.update({
      where: { contratoMedidorId: id },
      data: updateDto,
    });
  }

  async finalizarVinculo(
    id: bigint,
    motivoCambio?: string,
  ): Promise<ContratoMedidor> {
    await this.buscarContrato(id);
    return await this.prisma.contratoMedidor.update({
      where: { contratoMedidorId: id },
      data: {
        fechaFin: new Date(),
        motivoCambio: motivoCambio || 'Cambio de equipo o fin de contrato',
      },
    });
  }

  async eliminar(id: bigint): Promise<{ message: string }> {
    await this.buscarContrato(id);
    await this.prisma.contratoMedidor.update({
      where: { contratoMedidorId: id },
      data: { deletedAt: new Date() },
    });
    return { message: `Registro con ID ${id} eliminado` };
  }
}
