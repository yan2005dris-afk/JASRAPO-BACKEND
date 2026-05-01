import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoMedidor, Medidores } from 'src/generated/prisma/client';
import { CrearMedidorDto } from '../dto/create-medidor.dto';

@Injectable()
export class CreateDeviceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createDto: CrearMedidorDto): Promise<Medidores> {
    return await this.prisma.medidores.create({
      data: { ...createDto, estado: EstadoMedidor.BODEGA },
    });
  }
}
