import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CrearContratoMedidorDto } from '../dto/create-contrato-medidor.dto';

@Injectable()
export class CreateContractLinkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createDto: CrearContratoMedidorDto): Promise<any> {
    const medidorId = BigInt(createDto.medidorId);
    const contratoId = BigInt(createDto.contratoId);
    const lecturaInicial = createDto.lecturaInicial || 0;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Close any existing active history for this medidor or contract
      await tx.historialMedidores.updateMany({
        where: {
          OR: [{ medidorId, fechaHasta: null }, { contratoId, fechaHasta: null }],
        },
        data: { fechaHasta: new Date() },
      });

      // 2. Create new history entry
      await tx.historialMedidores.create({
        data: {
          medidorId,
          contratoId,
          lecturaInicial,
          fechaDesde: new Date(),
          motivo: 'VINCULACION MANUAL',
        },
      });

      // 3. Return the medidor or status
      return await tx.medidores.findUnique({
        where: { medidorId },
      });
    });
  }
}
