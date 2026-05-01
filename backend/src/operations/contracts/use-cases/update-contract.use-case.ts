import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ActualizarContratoMedidorDto } from '../dto/update-contrato-medidor.dto';

@Injectable()
export class UpdateContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: bigint,
    updateDto: ActualizarContratoMedidorDto,
  ): Promise<any> {
    const registro = await this.prisma.contratos.findUnique({
      where: { contratoId: id },
    });
    if (!registro || registro.deletedAt) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    }

    return await this.prisma.contratos.update({
      where: { contratoId: id },
      data: updateDto as any,
    });
  }
}
