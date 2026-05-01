import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CrearContratoMedidorDto } from '../dto/create-contrato-medidor.dto';

@Injectable()
export class CreateContractLinkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createDto: CrearContratoMedidorDto): Promise<any> {
    // Vinculamos el medidor al contrato en el modelo Medidores
    return await this.prisma.medidores.update({
      where: { medidorId: BigInt(createDto.medidorId) },
      data: {
        contratoId: BigInt(createDto.contratoId),
      },
    });
  }
}
