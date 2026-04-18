import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CrearContratoMedidorDto } from './dto/create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from './dto/update-contrato-medidor.dto';

@Injectable()
export class ContratoMedidorService {
  constructor(private readonly prisma: PrismaService) {}

  async crearContrato(createDto: CrearContratoMedidorDto): Promise<any> {
    // Vinculamos el medidor al contrato en el modelo Medidores
    return await this.prisma.medidores.update({
      where: { medidorId: BigInt(createDto.medidorId) },
      data: {
        contratoId: BigInt(createDto.contratoId),
      },
    });
  }

  async buscarContratos(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ContratosWhereInput;
  }): Promise<any[]> {
    return await this.prisma.contratos.findMany({
      ...params,
      where: { ...params.where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buscarContrato(id: bigint): Promise<any> {
    const registro = await this.prisma.contratos.findUnique({
      where: { contratoId: id },
    });
    if (!registro || registro.deletedAt)
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    return registro;
  }

  async actualizar(
    id: bigint,
    updateDto: ActualizarContratoMedidorDto,
  ): Promise<any> {
    await this.buscarContrato(id);
    return await this.prisma.contratos.update({
      where: { contratoId: id },
      data: updateDto as any,
    });
  }

  async finalizarVinculo(id: bigint): Promise<any> {
    // Desvinculamos el medidor del contrato
    return await this.prisma.medidores.update({
      where: { medidorId: id }, // Aquí el ID debería ser del medidor
      data: {
        contratoId: null as any,
      },
    });
  }

  async eliminar(id: bigint): Promise<{ message: string }> {
    await this.buscarContrato(id);
    await this.prisma.contratos.update({
      where: { contratoId: id },
      data: { deletedAt: new Date() },
    });
    return { message: `Contrato con ID ${id} eliminado` };
  }
}
